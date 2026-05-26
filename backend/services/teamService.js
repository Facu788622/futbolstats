'use strict';

const { Team, League, Player, Standing, Fixture } = require('../models');
const { AppError } = require('../middlewares/errorHandler');

const getAll = async ({ league_id } = {}) => {
  const where = {};
  if (league_id) where.league_id = league_id;
  return Team.findAll({
    where,
    include: [{ model: League, as: 'league', attributes: ['id', 'name', 'country'] }],
    order: [['name', 'ASC']],
  });
};

const getById = async (id) => {
  const team = await Team.findByPk(id, {
    include: [{ model: League, as: 'league', attributes: ['id', 'name', 'country'] }],
  });
  if (!team) throw new AppError('Equipo no encontrado', 404);
  return team;
};

const getPlayers = async (id) => {
  await getById(id);
  return Player.findAll({
    where: { team_id: id },
    order: [['position', 'ASC'], ['name', 'ASC']],
  });
};

const getStandings = async (id) => {
  await getById(id);
  return Standing.findAll({ where: { team_id: id } });
};

const create = async (data) => Team.create(data);

const update = async (id, data) => {
  const team = await getById(id);
  return team.update(data);
};

const remove = async (id) => {
  const team = await getById(id);
  await team.destroy();
};

module.exports = { getAll, getById, getPlayers, getStandings, create, update, remove };
