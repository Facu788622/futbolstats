'use strict';

const fixtureService = require('../services/fixtureService');

const getAll = async (req, res, next) => {
  try {
    const data = await fixtureService.getAll(req.query);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

const getById = async (req, res, next) => {
  try {
    const data = await fixtureService.getById(req.params.id);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

const getEvents = async (req, res, next) => {
  try {
    const data = await fixtureService.getEvents(req.params.id);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

const getStats = async (req, res, next) => {
  try {
    const data = await fixtureService.getStats(req.params.id);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

const create = async (req, res, next) => {
  try {
    const data = await fixtureService.create(req.body);
    res.status(201).json({ success: true, data });
  } catch (err) { next(err); }
};

const update = async (req, res, next) => {
  try {
    const data = await fixtureService.update(req.params.id, req.body);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

const patch = async (req, res, next) => {
  try {
    const data = await fixtureService.patch(req.params.id, req.body);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

const addEvent = async (req, res, next) => {
  try {
    const data = await fixtureService.addEvent(req.params.id, req.body);
    res.status(201).json({ success: true, data });
  } catch (err) { next(err); }
};

const remove = async (req, res, next) => {
  try {
    await fixtureService.remove(req.params.id);
    res.json({ success: true, message: 'Partido eliminado correctamente' });
  } catch (err) { next(err); }
};

module.exports = { getAll, getById, getEvents, getStats, create, update, patch, addEvent, remove };
