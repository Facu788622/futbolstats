'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    // league_id: 1 = Liga Profesional, 2 = Primera Nacional
    await queryInterface.bulkInsert('teams', [
      // Liga Profesional (league_id: 1)
      {
        name:       'River Plate',
        short_name: 'RIV',
        logo_url:   null,
        league_id:  1,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name:       'Boca Juniors',
        short_name: 'BOC',
        logo_url:   null,
        league_id:  1,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name:       'Racing Club',
        short_name: 'RAC',
        logo_url:   null,
        league_id:  1,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name:       'Independiente',
        short_name: 'IND',
        logo_url:   null,
        league_id:  1,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name:       'San Lorenzo',
        short_name: 'SLO',
        logo_url:   null,
        league_id:  1,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name:       'Huracán',
        short_name: 'HUR',
        logo_url:   null,
        league_id:  1,
        created_at: new Date(),
        updated_at: new Date(),
      },
      // Primera Nacional (league_id: 2)
      {
        name:       'Instituto',
        short_name: 'INS',
        logo_url:   null,
        league_id:  2,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name:       'Belgrano',
        short_name: 'BEL',
        logo_url:   null,
        league_id:  2,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('teams', null, {});
  },
};
