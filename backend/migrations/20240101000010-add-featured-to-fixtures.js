"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("fixtures", "featured", {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: "Indica si el partido es destacado en el admin",
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("fixtures", "featured");
  },
};
