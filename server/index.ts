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

  // Get the host and protocol from headers
  const host = req.header('host');
  const proto = req.header('x-forwarded-proto');
  const originalUrl = req.url;

  // Enhanced logging for debugging domain issues
  log(`Incoming request details:
    Host: ${host}
    Protocol: ${proto}
    URL: ${originalUrl}
    Headers: ${JSON.stringify(req.headers)}
  `);

  // Handle both custom domain and Replit domain
  if (process.env.NODE_ENV === 'production') {
    // Allow requests during domain verification
    const allowedDomains = [
      'breathwork.fyi',
      'www.breathwork.fyi',
      'breath-wave-brainappsllc.replit.app',
      '.replit.app',
      '.repl.co'
    ];

    // Check if this is a valid domain
    const isAllowedDomain = host && allowedDomains.some(domain => host.includes(domain));

    if (!isAllowedDomain) {
      log(`Unrecognized host: ${host}`);
      return res.status(403).send(`
        <html>
          <head>
            <title>Domain Setup Instructions</title>
            <style>
              body { font-family: system-ui; max-width: 600px; margin: 40px auto; padding: 0 20px; }
              h1 { color: #333; }
              .message { background: #f5f5f5; padding: 20px; border-radius: 8px; }
              .link { color: #0066cc; text-decoration: none; }
              .link:hover { text-decoration: underline; }
            </style>
          </head>
          <body>
            <h1>Domain Setup Instructions</h1>
            <div class="message">
              <p>To properly set up your domain, please ensure you have configured:</p>
              <ol>
                <li>An A record for breathwork.fyi pointing to 35.190.27.27</li>
                <li>A CNAME record for www.breathwork.fyi pointing to breath-wave-brainappsllc.replit.app</li>
              </ol>
              <p>Domain verification can take up to 30 minutes after DNS changes.</p>
              <p>In the meantime, you can access the application at: 
                <a class="link" href="https://breath-wave-brainappsllc.replit.app">https://breath-wave-brainappsllc.replit.app</a>
              </p>
              <p><strong>Note:</strong> If you've already configured these records, please allow up to 30 minutes for DNS propagation and SSL certificate generation.</p>
            </div>
          </body>
        </html>
      `);
    }

    // Handle www to non-www redirect for consistency
    if (host === 'www.breathwork.fyi') {
      return res.redirect(301, `https://breathwork.fyi${req.url}`);
    }

    // Force HTTPS for all valid domains
    if (proto !== 'https') {
      const redirectUrl = `https://${host}${req.url}`;
      log(`Redirecting to HTTPS: ${redirectUrl}`);
      return res.redirect(301, redirectUrl);
    }
  }

  next();
});

// Logging middleware
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