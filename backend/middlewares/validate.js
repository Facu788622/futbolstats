'use strict';

const { validationResult } = require('express-validator');

/**
 * Middleware que lee los resultados de express-validator.
 * Si hay errores de validación, responde 422 con el listado.
 * Si no hay errores, llama next() y continúa al controller.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      error: errors.array().map((e) => e.msg).join(', '),
      statusCode: 422,
    });
  }
  next();
};

module.exports = validate;
