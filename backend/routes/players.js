"use strict";

const path = require("path");
const fs = require("fs");
const { Router } = require("express");
const { body, param, query } = require("express-validator");
const multer = require("multer");
const controller = require("../controllers/playerController");
const { authenticate, requireAdmin } = require("../middlewares/auth");
const validate = require("../middlewares/validate");

const router = Router();

// Configuración de multer — guarda en backend/public/uploads/players/
const uploadDir = path.join(__dirname, "..", "public", "uploads", "players");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = `${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`;
    cb(null, name);
  },
});

const fileFilter = (_req, file, cb) => {
  if (file.mimetype.startsWith("image/")) cb(null, true);
  else cb(new Error("Solo se permiten imágenes"), false);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

const validPositions = ["GK", "DEF", "MID", "FWD"];

router.get(
  "/",
  [
    query("team_id").optional().isInt({ min: 1 }),
    query("position").optional().isIn(validPositions),
  ],
  validate,
  controller.getAll,
);
router.get(
  "/top-scorers",
  [
    query("league_id").optional().isInt({ min: 1 }),
    query("season_id").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1, max: 50 }),
  ],
  validate,
  controller.getTopScorers,
);
router.get(
  "/:id",
  [param("id").isInt({ min: 1 })],
  validate,
  controller.getById,
);
router.get(
  "/:id/stats",
  [param("id").isInt({ min: 1 })],
  validate,
  controller.getStats,
);

router.post(
  "/",
  authenticate,
  requireAdmin,
  [
    body("name").notEmpty(),
    body("position").isIn(validPositions),
    body("team_id").optional().isInt({ min: 1 }),
  ],
  validate,
  controller.create,
);

router.put(
  "/:id",
  authenticate,
  requireAdmin,
  [
    param("id").isInt({ min: 1 }),
    body("name").notEmpty(),
    body("position").isIn(validPositions),
  ],
  validate,
  controller.update,
);

// Nuevo endpoint: upload de foto
router.patch(
  "/:id/photo",
  authenticate,
  requireAdmin,
  [param("id").isInt({ min: 1 })],
  validate,
  upload.single("photo"),
  controller.uploadPhoto,
);

router.delete(
  "/:id",
  authenticate,
  requireAdmin,
  [param("id").isInt({ min: 1 })],
  validate,
  controller.remove,
);

module.exports = router;
