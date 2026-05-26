'use strict';

const { Router } = require('express');
const { body, param, query } = require('express-validator');
const controller = require('../controllers/fixtureController');
const { authenticate, requireAdmin } = require('../middlewares/auth');
const validate   = require('../middlewares/validate');

const router = Router();

const validStatus    = ['scheduled', 'live', 'finished'];
const validEventType = ['goal', 'yellow_card', 'red_card', 'substitution'];

// ─── Rutas públicas ───────────────────────────────────────────────────────────

// GET /api/fixtures
router.get(
  '/',
  [
    query('league_id').optional().isInt({ min: 1 }),
    query('matchday').optional().isInt({ min: 1 }),
    query('status').optional().isIn(validStatus),
  ],
  validate,
  controller.getAll
);

// GET /api/fixtures/:id
router.get(
  '/:id',
  [param('id').isInt({ min: 1 }).withMessage('ID inválido')],
  validate,
  controller.getById
);

// GET /api/fixtures/:id/stats
router.get(
  '/:id/stats',
  [param('id').isInt({ min: 1 }).withMessage('ID inválido')],
  validate,
  controller.getStats
);

// GET /api/fixtures/:id/events
router.get(
  '/:id/events',
  [param('id').isInt({ min: 1 }).withMessage('ID inválido')],
  validate,
  controller.getEvents
);

// ─── Rutas protegidas (admin) ─────────────────────────────────────────────────

// POST /api/fixtures
router.post(
  '/',
  authenticate, requireAdmin,
  [
    body('league_id').isInt({ min: 1 }).withMessage('league_id inválido'),
    body('home_team_id').isInt({ min: 1 }).withMessage('home_team_id inválido'),
    body('away_team_id').isInt({ min: 1 }).withMessage('away_team_id inválido'),
    body('date').isISO8601().withMessage('Fecha inválida (usar ISO8601)'),
    body('matchday').isInt({ min: 1 }).withMessage('matchday inválido'),
  ],
  validate,
  controller.create
);

// POST /api/fixtures/:id/events
router.post(
  '/:id/events',
  authenticate, requireAdmin,
  [
    param('id').isInt({ min: 1 }).withMessage('ID inválido'),
    body('team_id').isInt({ min: 1 }).withMessage('team_id inválido'),
    body('type').isIn(validEventType).withMessage('Tipo de evento inválido'),
    body('minute').isInt({ min: 1, max: 120 }).withMessage('Minuto inválido (1-120)'),
    body('player_id').optional().isInt({ min: 1 }),
  ],
  validate,
  controller.addEvent
);

// PUT /api/fixtures/:id
router.put(
  '/:id',
  authenticate, requireAdmin,
  [
    param('id').isInt({ min: 1 }).withMessage('ID inválido'),
    body('league_id').isInt({ min: 1 }),
    body('home_team_id').isInt({ min: 1 }),
    body('away_team_id').isInt({ min: 1 }),
    body('date').isISO8601(),
    body('matchday').isInt({ min: 1 }),
    body('status').isIn(validStatus),
  ],
  validate,
  controller.update
);

// PATCH /api/fixtures/:id
router.patch(
  '/:id',
  authenticate, requireAdmin,
  [
    param('id').isInt({ min: 1 }).withMessage('ID inválido'),
    body('status').optional().isIn(validStatus),
    body('home_score').optional().isInt({ min: 0 }),
    body('away_score').optional().isInt({ min: 0 }),
  ],
  validate,
  controller.patch
);

// DELETE /api/fixtures/:id
router.delete(
  '/:id',
  authenticate, requireAdmin,
  [param('id').isInt({ min: 1 }).withMessage('ID inválido')],
  validate,
  controller.remove
);

module.exports = router;
