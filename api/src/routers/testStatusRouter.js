// api/src/routers/testStatusRouter.js

import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * @openapi
 * /:
 *   get:
 *     tags:
 *       - TestStatus
 *     summary: Check API availability by the Index page
 *     description: Returns a simple HTML page confirming that backend is running.
 *     responses:
 *       200:
 *         description: Successful response (HTML)
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 *               example: "<html><body><h1>Hello, this backend is working correctly.</h1></body></html>"
 */
router.get("/", (req, res) => {
    res.type("html").send(`
        <html>
          <head>
            <title>API status</title>
            <style>
              body { font-family: sans-serif; padding: 40px; background: #fafbfc; color: #21262c; }
              h1 { font-size: 2em; }
            </style>
          </head>
          <body>
            <h1>Hello, FunFull is working correctly.</h1>
            <p>If you see this page, the backend server is up and responding to requests.</p>
          </body>
        </html>
    `);
});

/**
 * @openapi
 * /testAuth:
 *   get:
 *     summary: Check API availability with TOKEN (need to be authorized)
 *     tags:
 *        - TestStatus
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
 * /testPost:
 *   post:
 *     summary: Test POST endpoint (request/response with JSON)
 *     tags:
 *        - TestStatus
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
router.post("/testPost", async (req, res) => {
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