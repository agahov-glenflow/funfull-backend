// api/src/middleware/logger.js

/** Logs requests and responses */
export function logger(req, res, next) {
    const now = new Date().toISOString();

    // copy body to safety object as protection from changes
    const copedBody = { ...req.body };

    console.log(`[${now}] [${req.requestId}] [Request] Method: ${req.method} Original Url: ${req.originalUrl}`);
    console.log(`[${now}] [${req.requestId}] [Request] Headers: ${JSON.stringify(req.headers)}, Body: ${JSON.stringify(copedBody)}`);

    const start = Date.now();

    res.on("finish", () => {
        const duration = Date.now() - start;
        console.log(`[${now}] [${req.requestId}] [Response] Status ${res.statusCode} sent in ${duration}ms`);
    });

    next();
}