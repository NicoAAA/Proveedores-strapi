'use strict';

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/proveedores/:documentId/con-productos',
      handler: 'proveedorfull.getProveedorConProductos',
      config: {
        auth: false,
      },
    },
  ],
};
