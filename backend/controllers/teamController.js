'use strict';

const teamService = require('../services/teamService');

const getAll      = async (req, res, next) => { try { res.json({ success: true, data: await teamService.getAll(req.query) }); } catch (e) { next(e); } };
const getById     = async (req, res, next) => { try { res.json({ success: true, data: await teamService.getById(req.params.id) }); } catch (e) { next(e); } };
const getPlayers  = async (req, res, next) => { try { res.json({ success: true, data: await teamService.getPlayers(req.params.id) }); } catch (e) { next(e); } };
const getStandings= async (req, res, next) => { try { res.json({ success: true, data: await teamService.getStandings(req.params.id) }); } catch (e) { next(e); } };
const create      = async (req, res, next) => { try { res.status(201).json({ success: true, data: await teamService.create(req.body) }); } catch (e) { next(e); } };
const update      = async (req, res, next) => { try { res.json({ success: true, data: await teamService.update(req.params.id, req.body) }); } catch (e) { next(e); } };
const remove      = async (req, res, next) => { try { await teamService.remove(req.params.id); res.json({ success: true, message: 'Equipo eliminado' }); } catch (e) { next(e); } };

module.exports = { getAll, getById, getPlayers, getStandings, create, update, remove };
