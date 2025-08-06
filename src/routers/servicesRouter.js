// ./src/routers/servicesRouter.js

import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {getAllServices} from "../controllers/servicesController.js";
const router = express.Router();

/**
 * @openapi
 * /services:
 *   get:
 *     summary: Get all available services (requires authorization)
 *     tags:
 *       - Services
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all available services
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 services:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                         example: "10 Jumpers Ticket"
 *                       price:
 *                         type: string
 *                         example: "319.95"
 *                       relatedServices:
 *                         type: array
 *                         description: List of related upgrades for this service (if any)
 *                         items:
 *                           type: object
 *                           properties:
 *                             name:
 *                               type: string
 *                               example: "Upgrade to 2nd Floor Tables"
 *                             price:
 *                               type: string
 *                               example: "339.95"
 *             examples:
 *               sample:
 *                 summary: Example response
 *                 value:
 *                   services:
 *                     - name: "10 Jumpers Ticket"
 *                       price: "319.95"
 *                       relatedServices:
 *                         - name: "Upgrade to 2nd Floor Tables"
 *                           price: "339.95"
 *                         - name: "Upgrade to a Private Room"
 *                           price: "439.95"
 *                     - name: "Additional Jumper"
 *                       price: "25.00"
 *                     - name: "Small Altitude water bottle with 30 minute free jump pass"
 *                       price: "4.00"
 *                     - name: "Mini-Melts"
 *                       price: "5.00"
 */
router.get("/", authMiddleware, getAllServices);

export default router;