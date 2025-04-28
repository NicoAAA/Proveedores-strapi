const middlewares = require("../../../../config/middlewares");

console.log(' Cargando rutas personalizadas para productos.');

module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/productos/por-proveedor',
      handler: 'producto.productosPorProveedor',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/productos/multiplesCategorias',
      handler: 'producto.listProductMultiCategorias',
      config: {
        policies:[],
        middlewares: []
      }
    },
    {
      method: 'POST',
      path: '/productos/Categoria-Productos',
      handler: 'producto.listProductByCategoria',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/productos/CategoriaDeUnProducto',
      handler: 'producto.categorias_de_productos',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/productos/ListaProductosDeProveedorEspecifico',
      handler: 'producto.listaProductosDeProveedorEspecifico',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/productos/RegistrarProducto',
      handler: 'producto.registrarProducto',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ]
};