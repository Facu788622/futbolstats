'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Player extends Model {
    static associate(db) {
      Player.belongsTo(db.Team, { foreignKey: 'team_id', as: 'team' });
      Player.hasMany(db.FixtureEvent, { foreignKey: 'player_id', as: 'events' });
      Player.hasMany(db.PlayerStat, { foreignKey: 'player_id', as: 'stats' });
    }
  }

  Player.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(150),
        allowNull: false,
        validate: {
          notEmpty: { msg: 'El nombre del jugador no puede estar vacío' },
        },
      },
      position: {
        type: DataTypes.ENUM('GK', 'DEF', 'MID', 'FWD'),
        allowNull: false,
        validate: {
          isIn: {
            args: [['GK', 'DEF', 'MID', 'FWD']],
            msg: 'La posición debe ser GK, DEF, MID o FWD',
          },
        },
      },
      birth_date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        validate: {
          isDate: { msg: 'La fecha de nacimiento no tiene formato válido' },
        },
      },
      team_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'Player',
      tableName: 'players',
      underscored: true,
      timestamps: true,
    }
  );

  return Player;
};
