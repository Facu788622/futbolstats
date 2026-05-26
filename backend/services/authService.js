'use strict';

const bcrypt       = require('bcryptjs');
const jwt          = require('jsonwebtoken');
const { User }     = require('../models');
const { AppError } = require('../middlewares/errorHandler');

const generateToken = (user) =>
  jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

const register = async ({ email, password, role = 'viewer' }) => {
  const existing = await User.findOne({ where: { email } });
  if (existing) throw new AppError('El email ya está registrado', 409);

  const password_hash = await bcrypt.hash(password, 10);
  const user  = await User.create({ email, password_hash, role });
  const token = generateToken(user);

  return { user: { id: user.id, email: user.email, role: user.role }, token };
};

const login = async ({ email, password }) => {
  const user = await User.scope('withPassword').findOne({ where: { email } });
  if (!user) throw new AppError('Credenciales inválidas', 401);

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) throw new AppError('Credenciales inválidas', 401);

  const token = generateToken(user);
  return { user: { id: user.id, email: user.email, role: user.role }, token };
};

const getMe = async (userId) => {
  const user = await User.findByPk(userId);
  if (!user) throw new AppError('Usuario no encontrado', 404);
  return user;
};

module.exports = { register, login, getMe };
