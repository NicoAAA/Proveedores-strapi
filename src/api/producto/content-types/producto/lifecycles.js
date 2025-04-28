// ./src/api/producto/content-types/producto/lifecycles.js
'use strict';
const { ValidationError } = require('@strapi/utils').errors;

module.exports = {
  async beforeCreate({ params }) {
    const { fk_idProveedor, categorias } = params.data;

    if (!fk_idProveedor) {
      throw new ValidationError('El producto debe estar asociado a un proveedor.');
    }

    if (!Array.isArray(categorias) || categorias.length === 0) {
      throw new ValidationError('El producto debe tener al menos una categoría.');
    }
  },

  async beforeUpdate({ params }) {
    const { fk_idProveedor, categorias, data } = params.data;

    if (params.data.hasOwnProperty('fk_idProveedor') && !fk_idProveedor) {
      throw new ValidationError('No se puede eliminar la asociación al proveedor.');
    }

    if (
      params.data.hasOwnProperty('categorias') &&
      (!Array.isArray(categorias) || categorias.length === 0)
    ) {
      throw new ValidationError('El producto debe tener al menos una categoría.');
    }
  },
};

