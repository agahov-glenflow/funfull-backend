// api/src/middleware/authMiddleware.js

const secretAccessToken = process.env.SECRET_ACCESS_TOKEN || "";

export default function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;

    if(!authHeader || typeof authHeader !== 'string') {
        return res.status(401).json({"message": "No access token provided"});
    }

    const token = authHeader.split(' ')[1];
    if (!token || !secretAccessToken || token !== secretAccessToken) {
        return res.status(401).json({ error: 'Invalid access token' });
    }
    next();
}