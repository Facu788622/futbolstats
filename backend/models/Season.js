'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Season extends Model {
    static associate(db) {
      Season.hasMany(db.League, { foreignKey: 'season_id', as: 'leagues' });
      Season.hasMany(db.PlayerStat, { foreignKey: 'season_id', as: 'playerStats' });
    }
  }

  Season.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
          notEmpty: { msg: 'El nombre de la temporada no puede estar vacío' },
        },
      },
      year: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          isInt: true,
          min: { args: [2000], msg: 'El año debe ser mayor a 2000' },
        },
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    },
    {
      sequelize,
      modelName: 'Season',
      tableName: 'seasons',
      underscored: true,
      timestamps: true,
    }
  );

  return Season;
};
