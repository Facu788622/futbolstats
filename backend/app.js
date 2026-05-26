'use strict';

require('dotenv').config();
const express    = require('express');
const cors       = require('cors');
const morgan     = require('morgan');
const logger     = require('./middlewares/logger');
const { errorHandler } = require('./middlewares/errorHandler');

const app = express();

// ─── Middlewares globales ─────────────────────────────────────────────────────
app.use(cors({ origin: process.env.FRONTEND_URL }));
app.use(express.json());
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));
app.use(logger);

// ─── Ruta de salud ────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ success: true, message: 'FutbolStats API running' });
});

// ─── Rutas de la API ──────────────────────────────────────────────────────────
app.use('/api/auth',      require('./routes/auth'));
app.use('/api/fixtures',  require('./routes/fixtures'));
app.use('/api/teams',     require('./routes/teams'));
app.use('/api/players',   require('./routes/players'));
app.use('/api/standings', require('./routes/standings'));

// ─── 404 ─────────────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Ruta no encontrada', statusCode: 404 });
});

// ─── Error handler global (siempre último) ────────────────────────────────────
app.use(errorHandler);

module.exports = app;
