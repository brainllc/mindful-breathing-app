import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Enhanced custom domain handling
app.use((req, res, next) => {
  // Trust X-Forwarded-* headers from Replit's proxy
  app.set('trust proxy', true);

  // Get the host from headers
  const host = req.header('host');
  const proto = req.header('x-forwarded-proto');

  // Log the incoming request for debugging
  log(`Incoming request - Host: ${host}, Protocol: ${proto}, URL: ${req.url}`);

  // Handle both custom domain and Replit domain
  if (process.env.NODE_ENV === 'production') {
    // Force HTTPS
    if (proto !== 'https') {
      const redirectUrl = `https://${host}${req.url}`;
      log(`Redirecting to HTTPS: ${redirectUrl}`);
      return res.redirect(redirectUrl);
    }

    // Allow both custom domain and Replit domain
    if (host && (
      host.includes('breathwork.fyi') || 
      host.includes('replit.app') ||
      host.includes('repl.co')
    )) {
      log(`Valid host detected: ${host}`);
      return next();
    }

    // If host is not recognized, log it
    log(`Unrecognized host: ${host}`);
  }
  next();
});

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    log(`Error: ${message}`);
    res.status(status).json({ message });
    throw err;
  });

  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const PORT = 5000;

  server.listen(PORT, "0.0.0.0", () => {
    log(`Server running in ${app.get('env')} mode`);
    log(`Server listening on port ${PORT}`);
    log(`Access your app at https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co`);
  });
})();