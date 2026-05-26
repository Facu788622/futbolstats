'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class FixtureEvent extends Model {
    static associate(db) {
      FixtureEvent.belongsTo(db.Fixture, { foreignKey: 'fixture_id', as: 'fixture' });
      FixtureEvent.belongsTo(db.Player, { foreignKey: 'player_id', as: 'player' });
      FixtureEvent.belongsTo(db.Team, { foreignKey: 'team_id', as: 'team' });
    }
  }

  FixtureEvent.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      fixture_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      player_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      team_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      type: {
        type: DataTypes.ENUM('goal', 'yellow_card', 'red_card', 'substitution'),
        allowNull: false,
        validate: {
          isIn: {
            args: [['goal', 'yellow_card', 'red_card', 'substitution']],
            msg: 'El tipo de evento no es válido',
          },
        },
      },
      minute: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: { args: [1], msg: 'El minuto debe ser mayor a 0' },
          max: { args: [120], msg: 'El minuto no puede superar 120' },
        },
      },
    },
    {
      sequelize,
      modelName: 'FixtureEvent',
      tableName: 'fixture_events',
      underscored: true,
      timestamps: true,
    }
  );

  return FixtureEvent;
};
