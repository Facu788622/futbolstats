"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("players", "photo_url", {
      type: Sequelize.STRING(500),
      allowNull: true,
      defaultValue: null,
      comment: "URL de la foto de perfil del jugador",
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("players", "photo_url");
  },
};
