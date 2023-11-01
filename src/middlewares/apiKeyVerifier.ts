import express from 'express';
import dotenv from 'dotenv';
dotenv.config();

const API_KEY = process.env.API_KEY as string;

function verifyApiKey(req: express.Request, res: express.Response, next: express.NextFunction) {
    const apiKey = req.headers['x-api-key'] as string || req.query.api_key as string;
    if (apiKey && apiKey === API_KEY) {
        next();
    } else {
        res.status(401).json({ error: 'Unauthorized' });
    }
}

export { verifyApiKey };
