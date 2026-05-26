'use strict';

const { Router } = require('express');
const { body, param, query } = require('express-validator');
const controller = require('../controllers/teamController');
const { authenticate, requireAdmin } = require('../middlewares/auth');
const validate   = require('../middlewares/validate');

const router = Router();

router.get('/',           [query('league_id').optional().isInt({ min: 1 })], validate, controller.getAll);
router.get('/:id',        [param('id').isInt({ min: 1 })], validate, controller.getById);
router.get('/:id/players',[param('id').isInt({ min: 1 })], validate, controller.getPlayers);
router.get('/:id/standings',[param('id').isInt({ min: 1 })], validate, controller.getStandings);

router.post('/', authenticate, requireAdmin,
  [body('name').notEmpty(), body('league_id').isInt({ min: 1 })],
  validate, controller.create);

router.put('/:id', authenticate, requireAdmin,
  [param('id').isInt({ min: 1 }), body('name').notEmpty(), body('league_id').isInt({ min: 1 })],
  validate, controller.update);

router.delete('/:id', authenticate, requireAdmin,
  [param('id').isInt({ min: 1 })], validate, controller.remove);

module.exports = router;
