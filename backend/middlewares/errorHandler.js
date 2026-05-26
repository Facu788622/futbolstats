'use strict';

/**
 * Clase base para errores operacionales de la app.
 * Permite lanzar errores con statusCode desde cualquier capa:
 *
 *   throw new AppError('Partido no encontrado', 404)
 *   throw new AppError('Email ya registrado', 409)
 */
class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true; // distingue errores nuestros de bugs inesperados
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Middleware global de manejo de errores.
 * Express lo reconoce por tener exactamente 4 parámetros (err, req, res, next).
 * Debe registrarse ÚLTIMO en app.js, después de todas las rutas.
 */
const errorHandler = (err, req, res, next) => {
  // Log completo solo en desarrollo
  if (process.env.NODE_ENV === 'development') {
    console.error('❌ Error:', {
      message: err.message,
      statusCode: err.statusCode,
      stack: err.stack,
    });
  } else {
    console.error('❌ Error:', err.message);
  }

  // Error de validación de Sequelize (ej: campo unique duplicado)
  if (err.name === 'SequelizeUniqueConstraintError') {
    const field = err.errors[0]?.path || 'campo';
    return res.status(409).json({
      success: false,
      error: `El valor del campo '${field}' ya existe`,
      statusCode: 409,
    });
  }

  // Error de validación de Sequelize (ej: campo requerido vacío)
  if (err.name === 'SequelizeValidationError') {
    const messages = err.errors.map((e) => e.message).join(', ');
    return res.status(422).json({
      success: false,
      error: messages,
      statusCode: 422,
    });
  }

  // Error de FK en Sequelize (ej: team_id inexistente)
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return res.status(422).json({
      success: false,
      error: 'Referencia a un recurso inexistente',
      statusCode: 422,
    });
  }

  // Errores operacionales nuestros (AppError)
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message,
      statusCode: err.statusCode,
    });
  }

  // Error inesperado (bug): no exponer detalles en producción
  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'production'
      ? 'Error interno del servidor'
      : err.message,
    statusCode: 500,
  });
};

module.exports = { errorHandler, AppError };
