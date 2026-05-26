'use strict';

const { Standing, Team, League } = require('../models');
const { AppError } = require('../middlewares/errorHandler');

const getByLeague = async (league_id) => {
  const league = await League.findByPk(league_id);
  if (!league) throw new AppError('Liga no encontrada', 404);

  return Standing.findAll({
    where: { league_id },
    include: [{ model: Team, as: 'team', attributes: ['id', 'name', 'short_name', 'logo_url'] }],
    order: [
      ['points', 'DESC'],
      ['goals_for', 'DESC'],   // desempate 1: más goles a favor
    ],
  });
};

module.exports = { getByLeague };
