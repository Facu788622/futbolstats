'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('fixture_events', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      fixture_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'fixtures', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE', // si se borra el partido, se borran sus eventos
      },
      player_id: {
        type: Sequelize.INTEGER,
        allowNull: true, // null = evento sin jugador específico
        references: { model: 'players', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      team_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'teams', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      type: {
        type: Sequelize.ENUM('goal', 'yellow_card', 'red_card', 'substitution'),
        allowNull: false,
      },
      minute: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: 'Minuto del partido en que ocurrió el evento',
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
  },

  async down(queryInterface) {
    await queryInterface.dropTable('fixture_events');
  },
};
