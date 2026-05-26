'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert('seasons', [
      {
        name:       'Temporada 2024',
        year:       2024,
        is_active:  false,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name:       'Temporada 2025',
        year:       2025,
        is_active:  true,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('seasons', null, {});
  },
};
