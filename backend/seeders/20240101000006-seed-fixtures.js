'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    // league_id: 1 = Liga Profesional
    // Equipos: 1=River, 2=Boca, 3=Racing, 4=Independiente, 5=San Lorenzo, 6=Huracán
    await queryInterface.bulkInsert('fixtures', [
      // Fecha 1 - finalizados
      {
        league_id:    1,
        home_team_id: 1,
        away_team_id: 2,
        home_score:   2,
        away_score:   1,
        status:       'finished',
        date:         new Date('2025-03-01T20:00:00'),
        matchday:     1,
        deleted_at:   null,
        created_at:   new Date(),
        updated_at:   new Date(),
      },
      {
        league_id:    1,
        home_team_id: 3,
        away_team_id: 4,
        home_score:   0,
        away_score:   0,
        status:       'finished',
        date:         new Date('2025-03-02T18:00:00'),
        matchday:     1,
        deleted_at:   null,
        created_at:   new Date(),
        updated_at:   new Date(),
      },
      {
        league_id:    1,
        home_team_id: 5,
        away_team_id: 6,
        home_score:   1,
        away_score:   3,
        status:       'finished',
        date:         new Date('2025-03-02T20:00:00'),
        matchday:     1,
        deleted_at:   null,
        created_at:   new Date(),
        updated_at:   new Date(),
      },

      // Fecha 2 - finalizados
      {
        league_id:    1,
        home_team_id: 2,
        away_team_id: 3,
        home_score:   1,
        away_score:   2,
        status:       'finished',
        date:         new Date('2025-03-08T20:00:00'),
        matchday:     2,
        deleted_at:   null,
        created_at:   new Date(),
        updated_at:   new Date(),
      },
      {
        league_id:    1,
        home_team_id: 4,
        away_team_id: 5,
        home_score:   2,
        away_score:   2,
        status:       'finished',
        date:         new Date('2025-03-09T18:00:00'),
        matchday:     2,
        deleted_at:   null,
        created_at:   new Date(),
        updated_at:   new Date(),
      },
      {
        league_id:    1,
        home_team_id: 6,
        away_team_id: 1,
        home_score:   0,
        away_score:   1,
        status:       'finished',
        date:         new Date('2025-03-09T20:00:00'),
        matchday:     2,
        deleted_at:   null,
        created_at:   new Date(),
        updated_at:   new Date(),
      },

      // Fecha 3 - programados
      {
        league_id:    1,
        home_team_id: 1,
        away_team_id: 3,
        home_score:   null,
        away_score:   null,
        status:       'scheduled',
        date:         new Date('2025-03-15T20:00:00'),
        matchday:     3,
        deleted_at:   null,
        created_at:   new Date(),
        updated_at:   new Date(),
      },
      {
        league_id:    1,
        home_team_id: 2,
        away_team_id: 5,
        home_score:   null,
        away_score:   null,
        status:       'scheduled',
        date:         new Date('2025-03-16T18:00:00'),
        matchday:     3,
        deleted_at:   null,
        created_at:   new Date(),
        updated_at:   new Date(),
      },
      {
        league_id:    1,
        home_team_id: 4,
        away_team_id: 6,
        home_score:   null,
        away_score:   null,
        status:       'scheduled',
        date:         new Date('2025-03-16T20:00:00'),
        matchday:     3,
        deleted_at:   null,
        created_at:   new Date(),
        updated_at:   new Date(),
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('fixtures', null, {});
  },
};
