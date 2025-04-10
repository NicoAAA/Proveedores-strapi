module.exports = [
    {
      method: 'GET',
      path: '/productos/proveedor/:proveedorId',
      handler: 'producto.productosByProveedor',
      config: {
        auth: false,  // Define según si requieres autenticación o no
      },
    },
  ];
  