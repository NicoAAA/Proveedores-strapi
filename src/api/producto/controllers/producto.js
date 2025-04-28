'use strict';

const categoria = require('../../categoria/routes/categoria');

const { createCoreController } = require('@strapi/strapi').factories;


module.exports = createCoreController('api::producto.producto', ({ strapi }) => ({


  async registrarProducto(ctx) {
    try {
      const { data } = ctx.request.body || {};
      const errores = [];

      if (!data.nombre)      errores.push('Falta nombre');
      if (!data.descripcion) errores.push('Falta descripción');
      if (!data.precio)      errores.push('Falta precio');
      if (!data.stock)       errores.push('Falta stock');
      if (!data.proveedorDocumentId) {
        errores.push('Falta proveedorDocumentId');
      }
      if (
        !Array.isArray(data.categoriaDocumentIds) ||
        !data.categoriaDocumentIds.length
      ) {
        errores.push('Falta al menos una categoríaDocumentIds');
      }
      if (errores.length) {
        return ctx.badRequest(`Campos inválidos: ${errores.join(', ')}`);
      }

      // Traduce proveedorDocumentId → fk_idProveedor
      const prov = await strapi.db
        .query('api::proveedor.proveedor')
        .findOne({ where: { documentId: data.proveedorDocumentId } });
      if (!prov) {
        return ctx.badRequest(`Proveedor "${data.proveedorDocumentId}" no existe`);
      }

      // Traduce y valida categorías
      const catDocIds = data.categoriaDocumentIds;
      const cats = await strapi.db
        .query('api::categoria.categoria')
        .findMany({
          where: { documentId: { $in: catDocIds } },
          select: ['id','documentId'],
        });
      const encontrados = cats.map(c => c.documentId);
      const faltantes  = catDocIds.filter(id => !encontrados.includes(id));
      if (faltantes.length) {
        return ctx.badRequest(
          `Categorías no encontradas: ${faltantes.join(', ')}`
        );
      }

      // Aquí ya tenemos IDs puras, dejamos que el hook valide
      const nuevo = await strapi.entityService.create('api::producto.producto', {
        data: {
          nombre: data.nombre,
          descripcion: data.descripcion,
          precio: data.precio,
          stock: data.stock,
          // relación manyToOne:
          fk_idProveedor: prov.id,
          // relación manyToMany: 
          categorias: {
            connect: cats.map(c => c.id)
          },
          // opcionalmente, publícalo de una vez:
          publishedAt: new Date().toISOString()
        },
        // para devolver el objeto ya poblado
        populate: ['fk_idProveedor','categorias'],
      });
      return ctx.created({ data: nuevo });
    } catch (err) {
      console.error('❌ registrarProducto fatal error:', err);
      return ctx.internalServerError('Error inesperado al registrar producto');
    }
  },

  // I. Listar todos los productos de un proveedor específico.
  async listaProductosDeProveedorEspecifico(ctx) {
    try {
      const { nombre_proveedor } = ctx.request.body;
      if (!nombre_proveedor) {
        return ctx.badRequest("Falta el nombre del proveedor");
      }
      // 1. Buscar el proveedor por nombre
      const proveedor = await strapi.db.query("api::proveedor.proveedor").findOne({
        where: { nombre: nombre_proveedor },
      });
      if (!proveedor) {
        return ctx.notFound("Proveedor no encontrado");
      }
      // 2. Obtener productos del proveedor
      const productos = await strapi.db.query("api::producto.producto").findMany({
        where: {
          fk_idProveedor: proveedor.id,
        },
        populate: {
          fk_idProveedor: true,
          categorias: true
        },
      });

      // 3. Formatear la salida.
      const productosFormateados = productos.map((p) => ({
        producto: p.nombre,
        descripcion: p.descripcion,
        precio: p.precio,
        stock: p.stock,
        categorias: p.categorias.map(c => c.nombre)
      }));

      ctx.body = {
        Proveedor: nombre_proveedor,
        Productos: productosFormateados
      }


    } catch (err) {
      console.error(err);
      ctx.throw(500, "Error del servidor");
    }
  },

  // II. Consultar las categorías en las que está clasificado un producto.
  async categorias_de_productos(ctx) {
    try {
      const { nombre_producto } = ctx.request.body;
      if (!nombre_producto) {
        return ctx.badRequest("Falta el nombre del producto");
      }
      // 1. Buscar el producto por nombre
      const producto = await strapi.db.query("api::producto.producto").findOne({
        where: { nombre: nombre_producto },
        populate: ["categorias"],
      });
      if (!producto) {
        return ctx.notFound("Producto no encontrado");
      }
      // 2. Formatear la salida
      const categoriasFormateadas = producto.categorias.map((c) => ({
        Nombre_de_la_Categoria: c.nombre, 
        Descripcion: c.descripcion
      }));

      ctx.body = {
        Producto: nombre_producto,
        Categorias: categoriasFormateadas,
      }

    } catch (err) {
      console.error(err);
      ctx.throw(500, "Error del servidor");
    }
  },

  // III. Ver todos los productos que pertenecen a una categoría específica.
  async listProductByCategoria(ctx) {
    try {
      const { nombre_categoria } = ctx.request.body;
      if (!nombre_categoria) {
        return ctx.badRequest("Falta el nombre de la categoría");
      }
      // 1. Buscar la categoría por nombre
      const categoria = await strapi.db.query("api::categoria.categoria").findOne({
        where: { nombre: nombre_categoria },
      });
      if (!categoria) {
        return ctx.notFound("Categoría no encontrada");
      }
      // 2. Obtener productos de la categoría
      const productos = await strapi.db.query("api::producto.producto").findMany({
        where: {
          categorias: {
            id: categoria.id,
          },
        },
        populate: {
          categorias: true,
          fk_idProveedor: true,
        },
      });
      // 3. Formatear la salida
      const productosFormateados = productos.map((p) => ({
        producto: p.nombre,
        descripcion: p.descripcion,
        precio: p.precio,
        stock: p.stock,
        proveedor: p.fk_idProveedor ? p.fk_idProveedor.nombre : "Proveedor no especificado",
        categorias: p.categorias.map((c) => c.nombre),
      }));

      ctx.body = {
        Categoria: nombre_categoria,
        Productos: productosFormateados,
      };

    } catch (err) {
      console.error(err);
      ctx.throw(500, "Error del servidor");
    }
  },

  // IV. Listar los productos que pertenecen a múltiples categorías
  async listProductMultiCategorias(ctx){
    try{
      
      // 1. Buscar productos
      const productos = await strapi.db.query("api::producto.producto").findMany({
        populate: {
          fk_idProveedor: true,
          categorias: true
        },
      });
      
      // 2. Filtrar los que tienen mas categorias
      const productosFiltrados = productos.filter(
        (p) => p.categorias.length > 1
      );
      
      // 3. Eliminar duplicados por `documentId`
      const productosUnicos = Array.from(
        new Map(productosFiltrados.map(p => [p.documentId, p])).values()
      );

      // 4. Darles formato a la respuesta.
      const resultado = productosUnicos.map((p) => ({
        Producto: p.nombre,
        Descripcion: p.descripcion,
        Precio: p.precio,
        Stock: p.stock,
        Categorias: p.categorias.map(c => c.nombre),
        Proveedor: p.fk_idProveedor ? p.fk_idProveedor.nombre : "Proveedor no especificado",
      }));
  
      ctx.body = {
        Response: resultado
      }
    }catch (err){
      console.error(err);
      ctx.throw(500, "Error del servidor");
    }
  },
  



  // V. Funcion que Muestra los productos de un proveedor con caracteristicas
  //    detalladas sobre este.
  async productosPorProveedor(ctx) {
    try {
      const { nombre_proveedor } = ctx.request.body;

      if (!nombre_proveedor) {
        return ctx.badRequest("Falta el nombre del proveedor");
      }

      // 1. Buscar el proveedor por nombre
      const proveedor = await strapi.db.query("api::proveedor.proveedor").findOne({
        where: { nombre: nombre_proveedor },
      });

      if (!proveedor) {
        return ctx.notFound("Proveedor no encontrado");
      }

      // 2. Obtener productos del proveedor
      const productos = await strapi.db.query("api::producto.producto").findMany({
        where: {
          fk_idProveedor: proveedor.id,
        },
        populate: {
          fk_idProveedor: true,
          categorias: true
        },
      });

      console.log(productos);
      // 3. Formatear la salida
      const info_proovedorFormateado= {
        proveedor: {
          nombre: proveedor.nombre,
          email: proveedor.email,
          telefono: proveedor.telefono,
          direccion: proveedor.direccion,
          nombre_contacto: proveedor.nombre_contacto
        },
      }
      const productosFormateados = productos.map((p) => ({
        producto: p.nombre,
        descripcion: p.descripcion,
        precio: p.precio,
        stock: p.stock,
        categorias: p.categorias.map(c => c.nombre)
      }));

      ctx.body = { 
        data: [
          info_proovedorFormateado,
          productosFormateados 
        ]
      };

    } catch (err) {
      console.error("Error al buscar productos por proveedor:", err);
      ctx.throw(500, "Error del servidor");
    }
  }
}));



