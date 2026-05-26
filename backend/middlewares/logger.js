'use strict';

/**
 * Middleware de logging propio (complementa a morgan).
 * Registra: método, ruta, status, duración y usuario autenticado (si hay).
 *
 * Morgan loguea cuando el request ENTRA.
 * Este logger loguea cuando la respuesta SALE → tiene el statusCode real.
 */
const logger = (req, res, next) => {
  const start = Date.now();

  // Hook en el evento 'finish' de la respuesta
  res.on('finish', () => {
    const duration = Date.now() - start;
    const user     = req.user ? `[${req.user.email}]` : '[anon]';
    const status   = res.statusCode;

    // Color según status: verde 2xx, amarillo 3xx/4xx, rojo 5xx
    const color =
      status >= 500 ? '\x1b[31m' :  // rojo
      status >= 400 ? '\x1b[33m' :  // amarillo
      status >= 300 ? '\x1b[36m' :  // cyan
                      '\x1b[32m';   // verde
    const reset = '\x1b[0m';

    console.log(
      `${color}[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${status} ${duration}ms ${user}${reset}`
    );
  });

  next();
};

module.exports = logger;
