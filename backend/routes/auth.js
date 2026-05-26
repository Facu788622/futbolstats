'use strict';

const { Router } = require('express');
const { body }   = require('express-validator');
const controller = require('../controllers/authController');
const { authenticate } = require('../middlewares/auth');
const validate   = require('../middlewares/validate');

const router = Router();

// POST /api/auth/register
router.post(
  '/register',
  [
    body('email').isEmail().withMessage('Email inválido'),
    body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
  ],
  validate,
  controller.register
);

// POST /api/auth/login
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Email inválido'),
    body('password').notEmpty().withMessage('La contraseña es requerida'),
  ],
  validate,
  controller.login
);

// GET /api/auth/me  (requiere token)
router.get('/me', authenticate, controller.getMe);

module.exports = router;
