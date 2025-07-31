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

// Register routes synchronously
registerRoutes(app);

// Error handling middleware
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  log(`Error: ${message}`);
  res.status(status).json({ message });
});

// For local development, start the server
if (!process.env.VERCEL && process.env.NODE_ENV !== 'production') {
  import("http").then(({ createServer }) => {
    const server = createServer(app);
    const PORT = Number(process.env.PORT) || 5000;

    if (app.get("env") === "development") {
      setupVite(app, server).then(() => {
        server.listen(PORT, "0.0.0.0", () => {
          log(`Server running in ${app.get('env')} mode`);
          log(`Server listening on port ${PORT}`);
          if (process.env.REPL_SLUG && process.env.REPL_OWNER) {
            log(`Access your app at https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co`);
          }
        });
      });
    } else {
      serveStatic(app);
      server.listen(PORT, "0.0.0.0", () => {
        log(`Server running in ${app.get('env')} mode`);
        log(`Server listening on port ${PORT}`);
      });
    }
  });
}

// Export for Vercel serverless functions
export default app;