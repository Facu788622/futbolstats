'use strict';

const { Router } = require('express');
const { body, param, query } = require('express-validator');
const controller = require('../controllers/playerController');
const { authenticate, requireAdmin } = require('../middlewares/auth');
const validate   = require('../middlewares/validate');

const router = Router();

const validPositions = ['GK', 'DEF', 'MID', 'FWD'];

router.get('/',           [query('team_id').optional().isInt({ min: 1 }), query('position').optional().isIn(validPositions)], validate, controller.getAll);
router.get('/top-scorers',[query('league_id').optional().isInt({ min: 1 }), query('season_id').optional().isInt({ min: 1 }), query('limit').optional().isInt({ min: 1, max: 50 })], validate, controller.getTopScorers);
router.get('/:id',        [param('id').isInt({ min: 1 })], validate, controller.getById);
router.get('/:id/stats',  [param('id').isInt({ min: 1 })], validate, controller.getStats);

router.post('/', authenticate, requireAdmin,
  [body('name').notEmpty(), body('position').isIn(validPositions), body('team_id').optional().isInt({ min: 1 })],
  validate, controller.create);

router.put('/:id', authenticate, requireAdmin,
  [param('id').isInt({ min: 1 }), body('name').notEmpty(), body('position').isIn(validPositions)],
  validate, controller.update);

router.delete('/:id', authenticate, requireAdmin,
  [param('id').isInt({ min: 1 })], validate, controller.remove);

module.exports = router;
