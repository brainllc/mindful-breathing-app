import 'dotenv/config';
import express, { type Request, Response, NextFunction } from "express";
import compression from "compression";
import { registerRoutes } from "./routes.js";
import { setupVite, serveStatic, log } from "./vite";

const app = express();

app.use(compression()); // Add compression middleware
app.use(express.static('public')); // Serve static files from public directory
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// API request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (req.path.startsWith("/api")) {
      log(`${req.method} ${req.path} ${res.statusCode} in ${duration}ms`);
    }
  });
  next();
});

async function initializeApp() {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    log(`Error: ${message}`);
    res.status(status).json({ message });
  });

  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  return server;
}

// Initialize the app
const serverPromise = initializeApp();

// For local development, start the server
if (!process.env.VERCEL) {
  (async () => {
    const server = await serverPromise;
    const PORT = Number(process.env.PORT) || 5000;

    server.listen(PORT, "0.0.0.0", () => {
      log(`Server running in ${app.get('env')} mode`);
      log(`Server listening on port ${PORT}`);
      if (process.env.REPL_SLUG && process.env.REPL_OWNER) {
        log(`Access your app at https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co`);
      }
    });
  })();
}

// Export for Vercel
export default app;