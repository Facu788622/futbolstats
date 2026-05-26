'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    // Eventos solo para partidos finalizados (fixture_id: 1 al 6)
    // Jugadores: 1=Armani, 2=Montiel, 3=Enzo, 4=Julián(River) | 5=Romero,6=Figal,7=Pol,8=Cavani(Boca)
    //            9=Arias,10=Mena,11=Miranda,12=Adrián(Racing)  | 13=Rey,14=Lucas,15=Silvio(Independiente)
    //           16=Batalla,17=Barrios,18=Bareiro(SanLorenzo)   | 19=Silva,20=Mazzantti,21=Hezze(Huracán)
    await queryInterface.bulkInsert('fixture_events', [
      // Fixture 1: River 2-1 Boca (matchday 1)
      { fixture_id: 1, player_id: 4,  team_id: 1, type: 'goal',        minute: 23, created_at: new Date(), updated_at: new Date() },
      { fixture_id: 1, player_id: 8,  team_id: 2, type: 'goal',        minute: 45, created_at: new Date(), updated_at: new Date() },
      { fixture_id: 1, player_id: 4,  team_id: 1, type: 'goal',        minute: 78, created_at: new Date(), updated_at: new Date() },
      { fixture_id: 1, player_id: 7,  team_id: 2, type: 'yellow_card', minute: 55, created_at: new Date(), updated_at: new Date() },
      { fixture_id: 1, player_id: 6,  team_id: 2, type: 'yellow_card', minute: 80, created_at: new Date(), updated_at: new Date() },

      // Fixture 2: Racing 0-0 Independiente (matchday 1)
      { fixture_id: 2, player_id: 11, team_id: 3, type: 'yellow_card', minute: 34, created_at: new Date(), updated_at: new Date() },
      { fixture_id: 2, player_id: 14, team_id: 4, type: 'yellow_card', minute: 67, created_at: new Date(), updated_at: new Date() },
      { fixture_id: 2, player_id: 15, team_id: 4, type: 'red_card',    minute: 88, created_at: new Date(), updated_at: new Date() },

      // Fixture 3: San Lorenzo 1-3 Huracán (matchday 1)
      { fixture_id: 3, player_id: 18, team_id: 5, type: 'goal',        minute: 12, created_at: new Date(), updated_at: new Date() },
      { fixture_id: 3, player_id: 21, team_id: 6, type: 'goal',        minute: 30, created_at: new Date(), updated_at: new Date() },
      { fixture_id: 3, player_id: 21, team_id: 6, type: 'goal',        minute: 60, created_at: new Date(), updated_at: new Date() },
      { fixture_id: 3, player_id: 21, team_id: 6, type: 'goal',        minute: 90, created_at: new Date(), updated_at: new Date() },
      { fixture_id: 3, player_id: 17, team_id: 5, type: 'yellow_card', minute: 45, created_at: new Date(), updated_at: new Date() },

      // Fixture 4: Boca 1-2 Racing (matchday 2)
      { fixture_id: 4, player_id: 8,  team_id: 2, type: 'goal',        minute: 10, created_at: new Date(), updated_at: new Date() },
      { fixture_id: 4, player_id: 12, team_id: 3, type: 'goal',        minute: 50, created_at: new Date(), updated_at: new Date() },
      { fixture_id: 4, player_id: 12, team_id: 3, type: 'goal',        minute: 75, created_at: new Date(), updated_at: new Date() },
      { fixture_id: 4, player_id: 7,  team_id: 2, type: 'red_card',    minute: 65, created_at: new Date(), updated_at: new Date() },

      // Fixture 5: Independiente 2-2 San Lorenzo (matchday 2)
      { fixture_id: 5, player_id: 15, team_id: 4, type: 'goal',        minute: 20, created_at: new Date(), updated_at: new Date() },
      { fixture_id: 5, player_id: 18, team_id: 5, type: 'goal',        minute: 35, created_at: new Date(), updated_at: new Date() },
      { fixture_id: 5, player_id: 14, team_id: 4, type: 'goal',        minute: 70, created_at: new Date(), updated_at: new Date() },
      { fixture_id: 5, player_id: 17, team_id: 5, type: 'goal',        minute: 85, created_at: new Date(), updated_at: new Date() },

      // Fixture 6: Huracán 0-1 River (matchday 2)
      { fixture_id: 6, player_id: 3,  team_id: 1, type: 'goal',        minute: 55, created_at: new Date(), updated_at: new Date() },
      { fixture_id: 6, player_id: 20, team_id: 6, type: 'yellow_card', minute: 40, created_at: new Date(), updated_at: new Date() },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('fixture_events', null, {});
  },
};
