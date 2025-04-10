'use strict';

module.exports = {
  async listProductsMultipleCategories(ctx) {
    try {
      // 1. Consulta la colección intermedio_pro_cats con las relaciones pobladas.
      const interRecords = await strapi
        .service('api::intermedio-pro-cat.intermedio-pro-cat')
        .find({
          populate: {
            fk_idCategoria: true,  // Poblamos la relación con las categorías.
            idProducto: true,      // Poblamos la relación con el producto.
          },
        });

      // 2. Agrupar registros por idProducto y contar la cantidad de categorías asociadas.
      const productCategoryCount = {};

      interRecords.results.forEach(record => {
        const producto = record.idProducto; // Obtenemos el producto relacionado.
        if (!producto) return; // Si no hay producto relacionado, lo omitimos.

        const productId = producto.id; // Obtenemos el id del producto.

        // Dado que fk_idCategoria es many-to-many, esperamos un array de categorías.
        const categorias = record.fk_idCategoria || []; // Si no hay categorías, usamos un array vacío.
        const cantidad = Array.isArray(categorias) ? categorias.length : 0; // Contamos la cantidad de categorías.

        // Si el producto ya fue registrado, acumulamos la cantidad.
        if (productCategoryCount[productId]) {
          productCategoryCount[productId].count += cantidad; // Acumulamos la cantidad.
        } else {
          productCategoryCount[productId] = {
            product: producto,
            count: cantidad,
          }; // Registramos el producto con la cantidad de categorías.
        }
      });

      // 3. Filtrar los productos con más de 1 categoría asociada.
      const productsWithMultipleCategories = Object.values(productCategoryCount)
        .filter(item => item.count > 1)
        .map(item => item.product);

      // 4. Retornar la respuesta.
      ctx.send({ products: productsWithMultipleCategories });
    } catch (error) {
        console.error('Error en listProductsMultipleCategories:', error);
      ctx.throw(500, error);
    }
  },
};
