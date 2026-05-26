'use strict';

const { Router } = require('express');
const { param }  = require('express-validator');
const { getByLeague } = require('../services/standingService');
const validate   = require('../middlewares/validate');

const router = Router();

// GET /api/standings/:league_id
router.get(
  '/:league_id',
  [param('league_id').isInt({ min: 1 }).withMessage('league_id inválido')],
  validate,
  async (req, res, next) => {
    try {
      const data = await getByLeague(req.params.league_id);
      res.json({ success: true, data });
    } catch (err) { next(err); }
  }
);

module.exports = router;
