// ./src/routers/testStatusRouter.js

import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

/** Check API availability by the Index page - hidden from Swagger */
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

/** Check API availability with TOKEN (need to be authorized) - hidden from Swagger */
router.get("/testAuth", authMiddleware, async (req, res) => {
    res.json({ result: `Received GET request for path ${req.path}` });
});

/** Test POST endpoint (request/response with JSON) - hidden from Swagger */
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