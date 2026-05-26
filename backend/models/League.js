'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class League extends Model {
    static associate(db) {
      League.belongsTo(db.Season, { foreignKey: 'season_id', as: 'season' });
      League.hasMany(db.Team, { foreignKey: 'league_id', as: 'teams' });
      League.hasMany(db.Fixture, { foreignKey: 'league_id', as: 'fixtures' });
      League.hasMany(db.Standing, { foreignKey: 'league_id', as: 'standings' });
    }
  }

  League.init(
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
          notEmpty: { msg: 'El nombre de la liga no puede estar vacío' },
        },
      },
      country: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
          notEmpty: { msg: 'El país no puede estar vacío' },
        },
      },
      season_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'League',
      tableName: 'leagues',
      underscored: true,
      timestamps: true,
    }
  );

  return League;
};
