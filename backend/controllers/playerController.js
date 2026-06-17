"use strict";

const path = require("path");
const playerService = require("../services/playerService");

const getAll = async (req, res, next) => {
  try {
    res.json({ success: true, data: await playerService.getAll(req.query) });
  } catch (e) {
    next(e);
  }
};
const getById = async (req, res, next) => {
  try {
    res.json({
      success: true,
      data: await playerService.getById(req.params.id),
    });
  } catch (e) {
    next(e);
  }
};
const getStats = async (req, res, next) => {
  try {
    res.json({
      success: true,
      data: await playerService.getStats(req.params.id),
    });
  } catch (e) {
    next(e);
  }
};
const getTopScorers = async (req, res, next) => {
  try {
    res.json({
      success: true,
      data: await playerService.getTopScorers(req.query),
    });
  } catch (e) {
    next(e);
  }
};
const create = async (req, res, next) => {
  try {
    res
      .status(201)
      .json({ success: true, data: await playerService.create(req.body) });
  } catch (e) {
    next(e);
  }
};
const update = async (req, res, next) => {
  try {
    res.json({
      success: true,
      data: await playerService.update(req.params.id, req.body),
    });
  } catch (e) {
    next(e);
  }
};
const remove = async (req, res, next) => {
  try {
    await playerService.remove(req.params.id);
    res.json({ success: true, message: "Jugador eliminado" });
  } catch (e) {
    next(e);
  }
};

const uploadPhoto = async (req, res, next) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, error: "No se recibió ninguna imagen" });
    }
    const photo_url = `/uploads/players/${req.file.filename}`;
    const data = await playerService.update(req.params.id, { photo_url });
    res.json({ success: true, data, photo_url });
  } catch (e) {
    next(e);
  }
};

module.exports = {
  getAll,
  getById,
  getStats,
  getTopScorers,
  create,
  update,
  remove,
  uploadPhoto,
};
