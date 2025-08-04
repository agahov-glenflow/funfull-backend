// ./src/routers/apiDocsRouter.js

import express from "express";
import swaggerJSDoc from "swagger-jsdoc";
import prepareSwaggerOptions from "../utils/prepareSwaggerOptions.js";

const router = express.Router();
const swaggerSpec = swaggerJSDoc(prepareSwaggerOptions);

// Swagger UI HTML (CDN)
router.get('/', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Swagger UI</title>
        <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist/swagger-ui.css" />
      </head>
      <body>
        <div id="swagger-ui"></div>
        <script src="https://unpkg.com/swagger-ui-dist/swagger-ui-bundle.js"></script>
        <script src="https://unpkg.com/swagger-ui-dist/swagger-ui-standalone-preset.js"></script>
        <script>
          window.onload = () => {
            window.ui = SwaggerUIBundle({
              url: '/api-docs/openapi.json',
              dom_id: '#swagger-ui',
              presets: [
                SwaggerUIBundle.presets.apis,
                SwaggerUIStandalonePreset
              ],
              layout: "StandaloneLayout"
            });
          };
        </script>
      </body>
    </html>
  `);
});

// JSON with OpenAPI specification
router.get('/openapi.json', (req, res) => {
    res.json(swaggerSpec);
});

export default router;