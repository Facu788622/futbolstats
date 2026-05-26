'use strict';

const bcrypt = require('bcryptjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const passwordHash = await bcrypt.hash('admin1234', 10);
    const viewerHash  = await bcrypt.hash('viewer1234', 10);

    await queryInterface.bulkInsert('users', [
      {
        email:         'admin@futbolstats.com',
        password_hash: passwordHash,
        role:          'admin',
        created_at:    new Date(),
        updated_at:    new Date(),
      },
      {
        email:         'viewer@futbolstats.com',
        password_hash: viewerHash,
        role:          'viewer',
        created_at:    new Date(),
        updated_at:    new Date(),
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('users', null, {});
  },
};
