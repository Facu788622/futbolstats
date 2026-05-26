'use strict';

const { Op }       = require('sequelize');
const { Fixture, Team, League, FixtureEvent, Player, Standing } = require('../models');
const { AppError } = require('../middlewares/errorHandler');

// ─── Helpers ─────────────────────────────────────────────────────────────────

const fixtureIncludes = [
  { model: Team,   as: 'homeTeam', attributes: ['id', 'name', 'short_name', 'logo_url'] },
  { model: Team,   as: 'awayTeam', attributes: ['id', 'name', 'short_name', 'logo_url'] },
  { model: League, as: 'league',   attributes: ['id', 'name', 'country'] },
];

const buildWhere = ({ league_id, status, matchday }) => {
  const where = {};
  if (league_id) where.league_id = league_id;
  if (status)    where.status    = status;
  if (matchday)  where.matchday  = matchday;
  return where;
};

// ─── Service methods ──────────────────────────────────────────────────────────

const getAll = async (filters) => {
  return Fixture.findAll({
    where: buildWhere(filters),
    include: fixtureIncludes,
    order: [['date', 'ASC']],
  });
};

const getById = async (id) => {
  const fixture = await Fixture.findByPk(id, { include: fixtureIncludes });
  if (!fixture) throw new AppError('Partido no encontrado', 404);
  return fixture;
};

const getEvents = async (id) => {
  await getById(id); // verifica que existe
  return FixtureEvent.findAll({
    where: { fixture_id: id },
    include: [
      { model: Player, as: 'player', attributes: ['id', 'name', 'position'] },
      { model: Team,   as: 'team',   attributes: ['id', 'name', 'short_name'] },
    ],
    order: [['minute', 'ASC']],
  });
};

const getStats = async (id) => {
  const events = await getEvents(id);

  // Agrupa eventos por tipo y equipo
  const stats = { home: { goals: 0, yellow_cards: 0, red_cards: 0 },
                  away: { goals: 0, yellow_cards: 0, red_cards: 0 } };

  const fixture = await getById(id);

  events.forEach((e) => {
    const side = e.team_id === fixture.home_team_id ? 'home' : 'away';
    if (e.type === 'goal')        stats[side].goals++;
    if (e.type === 'yellow_card') stats[side].yellow_cards++;
    if (e.type === 'red_card')    stats[side].red_cards++;
  });

  return { fixture, stats, events };
};

const create = async (data) => {
  if (data.home_team_id === data.away_team_id) {
    throw new AppError('El equipo local y visitante no pueden ser el mismo', 422);
  }
  return Fixture.create(data);
};

const update = async (id, data) => {
  const fixture = await getById(id);
  if (data.home_team_id && data.home_team_id === data.away_team_id) {
    throw new AppError('El equipo local y visitante no pueden ser el mismo', 422);
  }
  return fixture.update(data);
};

const patch = async (id, data) => {
  const fixture = await getById(id);

  // Si se marca como finished, los scores son obligatorios
  if (data.status === 'finished') {
    const home = data.home_score ?? fixture.home_score;
    const away = data.away_score ?? fixture.away_score;
    if (home === null || away === null) {
      throw new AppError('Se requieren los marcadores para finalizar un partido', 422);
    }
  }
  return fixture.update(data);
};

const addEvent = async (fixtureId, data) => {
  const fixture = await getById(fixtureId);
  if (fixture.status === 'scheduled') {
    throw new AppError('No se pueden agregar eventos a un partido no iniciado', 422);
  }
  return FixtureEvent.create({ ...data, fixture_id: fixtureId });
};

const remove = async (id) => {
  const fixture = await getById(id);
  await fixture.destroy(); // soft delete por paranoid: true
};

module.exports = { getAll, getById, getEvents, getStats, create, update, patch, addEvent, remove };
