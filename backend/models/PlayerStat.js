'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class PlayerStat extends Model {
    static associate(db) {
      PlayerStat.belongsTo(db.Player, { foreignKey: 'player_id', as: 'player' });
      PlayerStat.belongsTo(db.Season, { foreignKey: 'season_id', as: 'season' });
    }
  }

  PlayerStat.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      player_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      season_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      goals: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: { min: 0 },
      },
      assists: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: { min: 0 },
      },
      yellow_cards: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: { min: 0 },
      },
      red_cards: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: { min: 0 },
      },
    },
    {
      sequelize,
      modelName: 'PlayerStat',
      tableName: 'player_stats',
      underscored: true,
      timestamps: true,
    }
  );

  return PlayerStat;
};
