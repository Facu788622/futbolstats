'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(db) {
      // User no tiene relaciones con otras tablas por ahora
    }
  }

  User.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        validate: {
          isEmail: { msg: 'El email no tiene un formato válido' },
          notEmpty: { msg: 'El email no puede estar vacío' },
        },
      },
      password_hash: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      role: {
        type: DataTypes.ENUM('admin', 'viewer'),
        allowNull: false,
        defaultValue: 'viewer',
        validate: {
          isIn: { args: [['admin', 'viewer']], msg: 'El rol debe ser admin o viewer' },
        },
      },
    },
    {
      sequelize,
      modelName: 'User',
      tableName: 'users',
      underscored: true,       // mapea createdAt → created_at automáticamente
      timestamps: true,
      // No exponemos password_hash en JSON por defecto
      defaultScope: {
        attributes: { exclude: ['password_hash'] },
      },
      scopes: {
        withPassword: { attributes: {} }, // para login: incluir todos los campos
      },
    }
  );

  return User;
};
