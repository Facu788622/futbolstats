'use strict';

const { Player, Team, PlayerStat, Season, FixtureEvent } = require('../models');
const { AppError } = require('../middlewares/errorHandler');

const getAll = async ({ team_id, position } = {}) => {
  const where = {};
  if (team_id)  where.team_id  = team_id;
  if (position) where.position = position;
  return Player.findAll({
    where,
    include: [{ model: Team, as: 'team', attributes: ['id', 'name', 'short_name'] }],
    order: [['name', 'ASC']],
  });
};

const getById = async (id) => {
  const player = await Player.findByPk(id, {
    include: [{ model: Team, as: 'team', attributes: ['id', 'name', 'short_name'] }],
  });
  if (!player) throw new AppError('Jugador no encontrado', 404);
  return player;
};

const getStats = async (id) => {
  await getById(id);
  return PlayerStat.findAll({
    where: { player_id: id },
    include: [{ model: Season, as: 'season', attributes: ['id', 'name', 'year'] }],
    order: [['season_id', 'DESC']],
  });
};

const getTopScorers = async ({ league_id, season_id, limit = 10 } = {}) => {
  // Busca jugadores con más goles en player_stats
  // Si se pasa league_id filtra por equipo → liga
  const include = [
    { model: Team,   as: 'team',   attributes: ['id', 'name', 'short_name'] },
    {
      model: PlayerStat,
      as: 'stats',
      where: season_id ? { season_id } : {},
      attributes: ['goals', 'assists', 'yellow_cards', 'red_cards', 'season_id'],
    },
  ];

  const players = await Player.findAll({
    include,
    order: [[{ model: PlayerStat, as: 'stats' }, 'goals', 'DESC']],
    limit: parseInt(limit),
  });

  return players;
};

const create = async (data) => Player.create(data);

const update = async (id, data) => {
  const player = await getById(id);
  return player.update(data);
};

const remove = async (id) => {
  const player = await getById(id);
  await player.destroy();
};

module.exports = { getAll, getById, getStats, getTopScorers, create, update, remove };
