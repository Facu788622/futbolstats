'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    // Tabla de posiciones calculada manualmente según los resultados de fixtures:
    //
    // River:        G2 E0 P0 → 6pts | GF:3 GC:1
    //   F1: ganó 2-1 (local)  | F6: ganó 0-1 (visitante)
    // Huracán:      G1 E0 P1 → 3pts | GF:3 GC:2
    //   F3: ganó 1-3 (visit.) | F6: perdió 0-1 (local)
    // Racing:       G1 E1 P0 → 4pts | GF:2 GC:1
    //   F2: empató 0-0 (local)| F4: ganó 1-2 (visit.)
    // Independiente:G0 E2 P0 → 2pts | GF:2 GC:2
    //   F2: empató 0-0 (visit)| F5: empató 2-2 (local)
    // San Lorenzo:  G0 E1 P1 → 1pt  | GF:3 GC:4
    //   F3: perdió 1-3 (local)| F5: empató 2-2 (visit.)
    // Boca:         G0 E0 P2 → 0pts | GF:2 GC:4
    //   F1: perdió 2-1 (visit)| F4: perdió 1-2 (local)

    await queryInterface.bulkInsert('standings', [
      { league_id: 1, team_id: 1, played: 2, won: 2, drawn: 0, lost: 0, points: 6, goals_for: 3, goals_against: 1, created_at: new Date(), updated_at: new Date() },
      { league_id: 1, team_id: 3, played: 2, won: 1, drawn: 1, lost: 0, points: 4, goals_for: 2, goals_against: 1, created_at: new Date(), updated_at: new Date() },
      { league_id: 1, team_id: 6, played: 2, won: 1, drawn: 0, lost: 1, points: 3, goals_for: 3, goals_against: 2, created_at: new Date(), updated_at: new Date() },
      { league_id: 1, team_id: 4, played: 2, won: 0, drawn: 2, lost: 0, points: 2, goals_for: 2, goals_against: 2, created_at: new Date(), updated_at: new Date() },
      { league_id: 1, team_id: 5, played: 2, won: 0, drawn: 1, lost: 1, points: 1, goals_for: 3, goals_against: 4, created_at: new Date(), updated_at: new Date() },
      { league_id: 1, team_id: 2, played: 2, won: 0, drawn: 0, lost: 2, points: 0, goals_for: 2, goals_against: 4, created_at: new Date(), updated_at: new Date() },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('standings', null, {});
  },
};
