'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    // season_id: 2 = Temporada 2025
    // Stats calculadas desde fixture_events:
    //
    // Julián Álvarez  (id:4)  → 2 goles (F1 x2)
    // Santiago Hezze  (id:21) → 3 goles (F3 x3)
    // Adrián Martínez (id:12) → 2 goles (F4 x2)
    // Adam Bareiro    (id:18) → 2 goles (F3, F5)
    // Edinson Cavani  (id:8)  → 2 goles (F1, F4)
    // Enzo Fernández  (id:3)  → 1 gol  (F6)
    // Silvio Romero   (id:15) → 1 gol  (F5)
    // Lucas Romero    (id:14) → 1 gol  (F5)
    // Nahuel Barrios  (id:17) → 1 gol  (F5)

    await queryInterface.bulkInsert('player_stats', [
      // River
      { player_id: 4,  season_id: 2, goals: 2, assists: 0, yellow_cards: 0, red_cards: 0, created_at: new Date(), updated_at: new Date() },
      { player_id: 3,  season_id: 2, goals: 1, assists: 0, yellow_cards: 0, red_cards: 0, created_at: new Date(), updated_at: new Date() },
      // Boca
      { player_id: 8,  season_id: 2, goals: 2, assists: 0, yellow_cards: 0, red_cards: 0, created_at: new Date(), updated_at: new Date() },
      { player_id: 7,  season_id: 2, goals: 0, assists: 0, yellow_cards: 1, red_cards: 1, created_at: new Date(), updated_at: new Date() },
      { player_id: 6,  season_id: 2, goals: 0, assists: 0, yellow_cards: 1, red_cards: 0, created_at: new Date(), updated_at: new Date() },
      // Racing
      { player_id: 12, season_id: 2, goals: 2, assists: 0, yellow_cards: 0, red_cards: 0, created_at: new Date(), updated_at: new Date() },
      { player_id: 11, season_id: 2, goals: 0, assists: 0, yellow_cards: 1, red_cards: 0, created_at: new Date(), updated_at: new Date() },
      // Independiente
      { player_id: 15, season_id: 2, goals: 1, assists: 0, yellow_cards: 0, red_cards: 1, created_at: new Date(), updated_at: new Date() },
      { player_id: 14, season_id: 2, goals: 1, assists: 0, yellow_cards: 1, red_cards: 0, created_at: new Date(), updated_at: new Date() },
      // San Lorenzo
      { player_id: 18, season_id: 2, goals: 2, assists: 0, yellow_cards: 0, red_cards: 0, created_at: new Date(), updated_at: new Date() },
      { player_id: 17, season_id: 2, goals: 1, assists: 0, yellow_cards: 1, red_cards: 0, created_at: new Date(), updated_at: new Date() },
      // Huracán
      { player_id: 21, season_id: 2, goals: 3, assists: 0, yellow_cards: 0, red_cards: 0, created_at: new Date(), updated_at: new Date() },
      { player_id: 20, season_id: 2, goals: 0, assists: 0, yellow_cards: 1, red_cards: 0, created_at: new Date(), updated_at: new Date() },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('player_stats', null, {});
  },
};
