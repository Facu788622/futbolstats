'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Standing extends Model {
    static associate(db) {
      Standing.belongsTo(db.League, { foreignKey: 'league_id', as: 'league' });
      Standing.belongsTo(db.Team, { foreignKey: 'team_id', as: 'team' });
    }

    // Getter virtual: diferencia de gol
    get goal_difference() {
      return this.goals_for - this.goals_against;
    }
  }

  Standing.init(
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
      team_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      played: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: { min: 0 },
      },
      won: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: { min: 0 },
      },
      drawn: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: { min: 0 },
      },
      lost: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: { min: 0 },
      },
      points: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: { min: 0 },
      },
      goals_for: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: { min: 0 },
      },
      goals_against: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: { min: 0 },
      },
      // Campo virtual calculado (no existe en la BD)
      goal_difference: {
        type: DataTypes.VIRTUAL,
        get() {
          return this.goals_for - this.goals_against;
        },
      },
    },
    {
      sequelize,
      modelName: 'Standing',
      tableName: 'standings',
      underscored: true,
      timestamps: true,
    }
  );

  return Standing;
};
