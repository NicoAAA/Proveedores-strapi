'use strict';

module.exports = {
  async getProveedorConProductos(ctx) {
    try {
      const { documentId } = ctx.params; // 'documentId' viene de la URL
      console.log('Valor de ctx.params.documentId:', documentId);

      // 1. Buscar el proveedor usando entityService y documentId
      // @ts-ignore
      const proveedores = await strapi.entityService.findMany('api::proveedor.proveedor', {
        filters: {
          documentId: { $eq: documentId }
        },
        publicationState: 'live' // Asegura que se devuelvan solo los publicados
      });
      console.log('Proveedores:', JSON.stringify(proveedores));

      const proveedor = proveedores && proveedores[0];
      if (!proveedor) {
        return ctx.notFound('Proveedor no encontrado');
      }

      // 2. Obtener los productos asociados usando el id numérico del proveedor
      const productosResponse = await strapi.entityService.findMany('api::producto.producto', {
        filters: {
          fk_idProveedor: { id: { $eq: proveedor.id } }
        },
        publicationState: 'live'
      });

      // 3. Combinar la información en la respuesta
      ctx.send({
        proveedor: proveedor,
        productos: productosResponse,
      });
    } catch (error) {
      console.error('Error en getProveedorConProductos:', error);
      ctx.throw(500, error);
    }
  },
};


