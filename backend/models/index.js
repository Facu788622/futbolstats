'use strict';

const { Sequelize } = require('sequelize');
const sequelize = require('../config/database');

// Importar todos los modelos
const User          = require('./User')(sequelize, Sequelize.DataTypes);
const Season        = require('./Season')(sequelize, Sequelize.DataTypes);
const League        = require('./League')(sequelize, Sequelize.DataTypes);
const Team          = require('./Team')(sequelize, Sequelize.DataTypes);
const Player        = require('./Player')(sequelize, Sequelize.DataTypes);
const Fixture       = require('./Fixture')(sequelize, Sequelize.DataTypes);
const FixtureEvent  = require('./FixtureEvent')(sequelize, Sequelize.DataTypes);
const Standing      = require('./Standing')(sequelize, Sequelize.DataTypes);
const PlayerStat    = require('./PlayerStat')(sequelize, Sequelize.DataTypes);

const db = {
  User,
  Season,
  League,
  Team,
  Player,
  Fixture,
  FixtureEvent,
  Standing,
  PlayerStat,
  sequelize,
  Sequelize,
};

// Ejecutar asociaciones de cada modelo
Object.values(db).forEach((model) => {
  if (model.associate) model.associate(db);
});

module.exports = db;
