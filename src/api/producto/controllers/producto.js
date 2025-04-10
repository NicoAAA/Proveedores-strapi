'use strict';

const { factories } = require('@strapi/strapi');
const axios = require('axios').default;

// Definimos la base del endpoint (ajústala según tu entorno)
const baseURL = 'http://localhost:1337/api/';

/**
 * Función asíncrona que lista todos los productos de un proveedor específico.
 * Extrae el `proveedorId` de los parámetros de la URL y consulta el endpoint "productos"
 * filtrando según la relación con el proveedor.
 *
 * @param {Object} ctx - Contexto de la petición de Koa.
 * @param {String|Number} proveedorId - Identificador del proveedor.
 */
async function functionGetProductosByProveedor(ctx, proveedorId) {
  try {
    const token = ctx.request.headers.authorization?.split(" ")[1];
    const response = await axios.get(`${baseURL}/productos`, {
      params: {
        'filters[fk_idProveedor][id][$eq]': proveedorId,
        populate: '*'
      },
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });
    ctx.body = response.data;
  } catch (error) {
    console.error("Error in functionGetProductosByProveedor:", error.message);
    if (error.response) {
      console.error("Error details:", error.response.data);
    }
    ctx.throw(500, `ERROR: Unable to fetch products for provider - ${error.message}`);
  }
}

// Exportamos el controlador usando factories.createCoreController y añadimos nuestro método personalizado
module.exports = factories.createCoreController('api::producto.producto', ({ strapi }) => ({
  async productosByProveedor(ctx) {
    console.log("Endpoint: GET /api/productos/proveedor/:proveedorId");
    const token = ctx.request.headers.authorization?.split(' ')[1];
    if (!token) {
      return ctx.unauthorized("No se ha enviado un token de autorización");
    }
    const { proveedorId } = ctx.params;
    try {
      await functionGetProductosByProveedor(ctx, proveedorId);
    } catch (error) {
      ctx.throw(500, "ERROR: No se pudieron obtener los productos del proveedor");
    }
  }
}));

