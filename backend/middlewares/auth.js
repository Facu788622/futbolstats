'use strict';

const jwt = require('jsonwebtoken');
const { User } = require('../models');

/**
 * Verifica que el request tenga un JWT válido en el header Authorization.
 * Si es válido, adjunta el usuario decodificado a req.user y llama next().
 * Si no, responde con 401.
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Token no proporcionado',
        statusCode: 401,
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Verificar que el usuario todavía existe en la BD
    const user = await User.findByPk(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Usuario no encontrado',
        statusCode: 401,
      });
    }

    req.user = user; // disponible en todos los controllers siguientes
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'El token expiró',
        statusCode: 401,
      });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: 'Token inválido',
        statusCode: 401,
      });
    }
    next(error); // error inesperado → lo maneja errorHandler
  }
};

/**
 * Verifica que el usuario autenticado tenga rol 'admin'.
 * Siempre se usa DESPUÉS de authenticate, nunca solo.
 *
 * Uso en rutas:
 *   router.post('/', authenticate, requireAdmin, controller.create)
 */
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Acceso denegado: se requiere rol admin',
      statusCode: 403,
    });
  }
  next();
};

module.exports = { authenticate, requireAdmin };
