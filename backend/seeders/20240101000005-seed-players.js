'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    // team_id: 1=River, 2=Boca, 3=Racing, 4=Independiente, 5=San Lorenzo, 6=Huracán
    await queryInterface.bulkInsert('players', [
      // River Plate (team_id: 1)
      { name: 'Franco Armani',       position: 'GK',  birth_date: '1986-10-16', team_id: 1, created_at: new Date(), updated_at: new Date() },
      { name: 'Gonzalo Montiel',     position: 'DEF', birth_date: '1997-01-01', team_id: 1, created_at: new Date(), updated_at: new Date() },
      { name: 'Enzo Fernández',      position: 'MID', birth_date: '2001-01-17', team_id: 1, created_at: new Date(), updated_at: new Date() },
      { name: 'Julián Álvarez',      position: 'FWD', birth_date: '2000-01-31', team_id: 1, created_at: new Date(), updated_at: new Date() },

      // Boca Juniors (team_id: 2)
      { name: 'Sergio Romero',       position: 'GK',  birth_date: '1987-02-22', team_id: 2, created_at: new Date(), updated_at: new Date() },
      { name: 'Nicolás Figal',       position: 'DEF', birth_date: '1994-09-27', team_id: 2, created_at: new Date(), updated_at: new Date() },
      { name: 'Pol Fernández',       position: 'MID', birth_date: '1991-04-22', team_id: 2, created_at: new Date(), updated_at: new Date() },
      { name: 'Edinson Cavani',      position: 'FWD', birth_date: '1987-02-14', team_id: 2, created_at: new Date(), updated_at: new Date() },

      // Racing Club (team_id: 3)
      { name: 'Gabriel Arias',       position: 'GK',  birth_date: '1990-03-03', team_id: 3, created_at: new Date(), updated_at: new Date() },
      { name: 'Eugenio Mena',        position: 'DEF', birth_date: '1988-07-18', team_id: 3, created_at: new Date(), updated_at: new Date() },
      { name: 'Leonel Miranda',      position: 'MID', birth_date: '2000-05-09', team_id: 3, created_at: new Date(), updated_at: new Date() },
      { name: 'Adrián Martínez',     position: 'FWD', birth_date: '1998-01-16', team_id: 3, created_at: new Date(), updated_at: new Date() },

      // Independiente (team_id: 4)
      { name: 'Rodrigo Rey',         position: 'GK',  birth_date: '1992-06-27', team_id: 4, created_at: new Date(), updated_at: new Date() },
      { name: 'Lucas Romero',        position: 'MID', birth_date: '1994-11-09', team_id: 4, created_at: new Date(), updated_at: new Date() },
      { name: 'Silvio Romero',       position: 'FWD', birth_date: '1990-05-10', team_id: 4, created_at: new Date(), updated_at: new Date() },

      // San Lorenzo (team_id: 5)
      { name: 'Augusto Batalla',     position: 'GK',  birth_date: '1994-06-04', team_id: 5, created_at: new Date(), updated_at: new Date() },
      { name: 'Nahuel Barrios',      position: 'MID', birth_date: '1999-12-04', team_id: 5, created_at: new Date(), updated_at: new Date() },
      { name: 'Adam Bareiro',        position: 'FWD', birth_date: '1996-05-12', team_id: 5, created_at: new Date(), updated_at: new Date() },

      // Huracán (team_id: 6)
      { name: 'Antony Silva',        position: 'GK',  birth_date: '1985-03-15', team_id: 6, created_at: new Date(), updated_at: new Date() },
      { name: 'Walter Mazzantti',    position: 'DEF', birth_date: '1993-08-22', team_id: 6, created_at: new Date(), updated_at: new Date() },
      { name: 'Santiago Hezze',      position: 'FWD', birth_date: '2002-03-12', team_id: 6, created_at: new Date(), updated_at: new Date() },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('players', null, {});
  },
};
