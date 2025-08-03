import type { VercelRequest, VercelResponse } from '@vercel/node';

import express from "express";
import { registerRoutes } from "../server/routes.js";

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// CORS for production
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }
  next();
});

// Register all routes
registerRoutes(app);

// Export as Vercel serverless function
export default (req: VercelRequest, res: VercelResponse) => {
  return app(req, res);
};