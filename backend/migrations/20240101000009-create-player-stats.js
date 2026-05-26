'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('player_stats', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      player_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'players', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      season_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'seasons', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      goals: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      assists: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      yellow_cards: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      red_cards: {
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

    // Índice único: un jugador solo puede tener una fila de stats por temporada
    await queryInterface.addIndex('player_stats', ['player_id', 'season_id'], {
      unique: true,
      name: 'player_stats_player_season_unique',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('player_stats');
  },
};
