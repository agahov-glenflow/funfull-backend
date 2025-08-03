// api/src/routers/baseRouter.js

import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * @openapi
 * /:
 *   get:
 *     tags:
 *        - Connectivity
 *     summary: Check API availability
 *     responses:
 *       200:
 *         description: Successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 result:
 *                   type: string
 *                   example: "Received GET request for path /"
 */
router.get("/", async (req, res) => {
    res.json({
        result: `Received GET request for path ${req.path}`,
    });
})

/**
 * @openapi
 * /testAuth:
 *   get:
 *     summary: Check API availability with TOKEN (need to be authorized)
 *     tags:
 *        - Connectivity
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful answer
 */
router.get("/testAuth", authMiddleware, async (req, res) => {
    res.json({ result: `Received GET request for path ${req.path}` });
});

/**
 * @openapi
 * /:
 *   post:
 *     summary: Test POST endpoint (request/response with JSON)
 *     tags:
 *        - Connectivity
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             example:
 *               key: value
 *     responses:
 *       200:
 *         description: Successful response with echoed request body
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 result:
 *                   type: string
 *                   example: "Received POST request for path /. Return the same body."
 *                 originalBody:
 *                   type: object
 *                   example:
 *                     key: value
 */
router.post("/", async (req, res) => {
    res.json({
        result: `Received POST request for path ${req.path}. Return the same body.`,
        originalBody: req.body,
    });
})

// 404 handler for all undefined paths
router.use((req, res) => {
    res.status(404).json({ error: "Route not found" });
});

export default router;