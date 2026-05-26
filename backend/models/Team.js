'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Team extends Model {
    static associate(db) {
      Team.belongsTo(db.League, { foreignKey: 'league_id', as: 'league' });
      Team.hasMany(db.Player, { foreignKey: 'team_id', as: 'players' });
      // Un equipo puede ser local o visitante en distintos partidos
      Team.hasMany(db.Fixture, { foreignKey: 'home_team_id', as: 'homeFixtures' });
      Team.hasMany(db.Fixture, { foreignKey: 'away_team_id', as: 'awayFixtures' });
      Team.hasMany(db.Standing, { foreignKey: 'team_id', as: 'standings' });
      Team.hasMany(db.FixtureEvent, { foreignKey: 'team_id', as: 'events' });
    }
  }

  Team.init(
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
          notEmpty: { msg: 'El nombre del equipo no puede estar vacío' },
        },
      },
      short_name: {
        type: DataTypes.STRING(10),
        allowNull: true,
      },
      logo_url: {
        type: DataTypes.STRING(500),
        allowNull: true,
        validate: {
          isUrl: { msg: 'El logo_url debe ser una URL válida' },
        },
      },
      league_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'Team',
      tableName: 'teams',
      underscored: true,
      timestamps: true,
    }
  );

  return Team;
};
