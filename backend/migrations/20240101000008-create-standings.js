'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('standings', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      league_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'leagues', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      team_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'teams', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      played: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      won: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      drawn: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      lost: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      points: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      goals_for: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      goals_against: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
      },
    });

    // Índice único: un equipo solo puede tener una fila por liga
    await queryInterface.addIndex('standings', ['league_id', 'team_id'], {
      unique: true,
      name: 'standings_league_team_unique',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('standings');
  },
};
