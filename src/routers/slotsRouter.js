// ./src/slotsRouter.js

import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {getAvailableSlots} from "../controllers/slotsController.js";

const router = express.Router();

/**
 * @openapi
 * /slots:
 *   get:
 *     summary: Get all available reservation slots (need to be authorized)
 *     tags:
 *       - Slots
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of available slots
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 availableSlots:
 *                   type: array
 *                   description: Array of available slot objects
 *                   items:
 *                     type: object
 */
router.get("/", authMiddleware, getAvailableSlots);

export default router;