'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    // season_id: 1 = Temporada 2024, 2 = Temporada 2025
    await queryInterface.bulkInsert('leagues', [
      {
        name:       'Liga Profesional',
        country:    'Argentina',
        season_id:  2,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name:       'Primera Nacional',
        country:    'Argentina',
        season_id:  2,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('leagues', null, {});
  },
};
