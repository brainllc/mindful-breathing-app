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
    const isAllowedDomain = host && allowedDomains.some(domain =>
      host === domain || (domain.startsWith('.') && host.endsWith(domain))
    );

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
              .code { background: #f0f0f0; padding: 2px 6px; border-radius: 4px; font-family: monospace; }
            </style>
          </head>
          <body>
            <h1>Domain Setup Instructions</h1>
            <div class="message">
              <p>To properly set up your domain, please configure the following DNS records:</p>
              <ol>
                <li>For <span class="code">breathwork.fyi</span>:
                  <ul>
                    <li>Type: <span class="code">A</span></li>
                    <li>Name: <span class="code">@</span></li>
                    <li>Value: <span class="code">35.190.27.27</span></li>
                    <li>TTL: <span class="code">3600</span> (or default)</li>
                  </ul>
                </li>
                <li>For <span class="code">www.breathwork.fyi</span>:
                  <ul>
                    <li>Type: <span class="code">CNAME</span></li>
                    <li>Name: <span class="code">www</span></li>
                    <li>Value: <span class="code">breath-wave-brainappsllc.replit.app</span></li>
                    <li>TTL: <span class="code">3600</span> (or default)</li>
                  </ul>
                </li>
              </ol>
              <p><strong>Important Notes:</strong></p>
              <ul>
                <li>DNS changes can take up to 48 hours to propagate globally</li>
                <li>The SSL certificate will be automatically provisioned once DNS is properly configured</li>
                <li>You can access the app directly at <a class="link" href="https://breath-wave-brainappsllc.replit.app">https://breath-wave-brainappsllc.replit.app</a> while waiting</li>
              </ul>
              <p>If you continue to experience issues after 48 hours, please verify your DNS settings or contact your domain registrar for assistance.</p>
            </div>
          </body>
        </html>
      `);
    }

    // Handle www to non-www redirect after domain validation
    if (host?.startsWith('www.')) {
      const nonWwwHost = host.replace('www.', '');
      return res.redirect(301, `${proto}://${nonWwwHost}${req.url}`);
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