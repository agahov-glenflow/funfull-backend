// /api/index.js

import "dotenv/config";
import express from "express";
import {requestId} from "./src/middleware/requestId.js";
import {logger} from "./src/middleware/logger.js";
import {errorHandler} from "./src/middleware/errorHandler.js";
import baseRouter from "./src/routers/baseRouter.js";
import apiDocsRouter from "./src/routers/apiDocsRouter.js";
import eventsRouter from "./src/routers/eventsRouter.js";

if (process.env.NODE_ENV === 'development') {
	console.log('Happy developing mode is enabled ✨')
}

const app = express();
const port = process.env.PORT || 3000;

app.use(requestId) // Always first because need to set UUID
app.use(express.json()); // Always the second because need to parse JSON
app.use(logger) // Always the third because need to logging requests and responses

// SWAGGER
app.use('/api-docs', apiDocsRouter); // http://localhost:3000/api-docs

// EVENTS processing
app.use("/events", eventsRouter);

// THE FINAL ROUTER
app.use("/", baseRouter); // should be always the last

app.use(errorHandler); // uncaught errors processing

app.listen(port, () => console.log(`Server ready on port ${port}`));

export default app;
