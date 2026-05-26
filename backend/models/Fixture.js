'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Fixture extends Model {
    static associate(db) {
      Fixture.belongsTo(db.League, { foreignKey: 'league_id', as: 'league' });
      Fixture.belongsTo(db.Team, { foreignKey: 'home_team_id', as: 'homeTeam' });
      Fixture.belongsTo(db.Team, { foreignKey: 'away_team_id', as: 'awayTeam' });
      Fixture.hasMany(db.FixtureEvent, { foreignKey: 'fixture_id', as: 'events' });
    }
  }

  Fixture.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      league_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      home_team_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      away_team_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      home_score: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null,
        validate: {
          min: { args: [0], msg: 'El marcador no puede ser negativo' },
        },
      },
      away_score: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null,
        validate: {
          min: { args: [0], msg: 'El marcador no puede ser negativo' },
        },
      },
      status: {
        type: DataTypes.ENUM('scheduled', 'live', 'finished'),
        allowNull: false,
        defaultValue: 'scheduled',
      },
      date: {
        type: DataTypes.DATE,
        allowNull: false,
        validate: {
          isDate: { msg: 'La fecha del partido no tiene formato válido' },
        },
      },
      matchday: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: { args: [1], msg: 'La fecha debe ser mayor a 0' },
        },
      },
      deleted_at: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null,
      },
    },
    {
      sequelize,
      modelName: 'Fixture',
      tableName: 'fixtures',
      underscored: true,
      timestamps: true,
      paranoid: true,         // activa soft delete: usa deleted_at automáticamente
      deletedAt: 'deleted_at',
    }
  );

  return Fixture;
};
