// ./src/routers/servicesRouter.js

import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {getAllServices} from "../controllers/servicesController.js";
const router = express.Router();

/**
 * @openapi
 * /services:
 *   get:
 *     summary: Get all services (need to be authorized)
 *     tags:
 *       - Services
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of services
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
router.get("/", authMiddleware, getAllServices);

export default router;