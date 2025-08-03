// /api/index.js

import "dotenv/config";
import express from "express";
import {requestId} from "./src/middleware/requestId.js";
import {logger} from "./src/middleware/logger.js";
import {errorHandler} from "./src/middleware/errorHandler.js";
import baseRouter from "./src/routers/baseRouter.js";
import prepareSwaggerOptions from "./src/utils/prepareSwaggerOptions.js";
import swaggerUi from 'swagger-ui-express';
import swaggerJSDoc from 'swagger-jsdoc';

if (process.env.NODE_ENV === 'development') {
	console.log('Happy developing mode is enabled ✨')
}

const app = express();
const port = process.env.PORT || 3000;

app.use(requestId) // Always first because need to set UUID
app.use(express.json()); // Always the second because need to parse JSON
app.use(logger) // Always the third because need to logging requests and responses

// SWAGGER
const swaggerSpec = swaggerJSDoc(prepareSwaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
console.log('Swagger UI available at http://localhost:' + port + '/api-docs'); // e.g. http://localhost:3000/api-docs

app.use("/", baseRouter) // final router

app.use(errorHandler)

app.listen(port, () => console.log(`Server ready on port ${port}`));

export default app;
