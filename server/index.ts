import express, { type Request, Response, NextFunction } from "express";
import compression from "compression";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import path from "path";
import fs from "fs";

const app = express();
app.use(compression()); // Add compression middleware

// Specific handler for sitemap.xml
app.get('/sitemap.xml', (req, res) => {
  const sitemapPath = path.join(process.cwd(), 'public', 'sitemap.xml');
  fs.readFile(sitemapPath, (err, data) => {
    if (err) {
      log(`Error reading sitemap: ${err}`);
      return res.status(500).send('Error reading sitemap');
    }
    res.header('Content-Type', 'application/xml');
    res.send(data);
  });
});

app.use(express.static('public')); // Serve static files from public directory
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Enhanced domain handling middleware
app.use((req, res, next) => {
  // Trust X-Forwarded-* headers from Replit's proxy
  app.set('trust proxy', true);

  const host = req.get('host');
  const proto = req.get('x-forwarded-proto');

  // Enhanced logging for debugging domain issues
  log(`Domain request:
    Host: ${host}
    Protocol: ${proto}
    URL: ${req.url}
    Headers: ${JSON.stringify(req.headers)}
  `);

  if (process.env.NODE_ENV === 'production') {
    if (!host) {
      log('No host header found');
      return res.status(400).send('No host header');
    }

    // Define allowed domains
    const replitDomain = process.env.REPL_SLUG ?
      `${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co` :
      'breath-wave-brainappsllc.replit.app';
    const customDomain = 'breathwork.fyi';

    // Configure allowed domains
    const allowedDomains = [
      customDomain,
      `www.${customDomain}`,
      replitDomain,
      '.replit.app',
      '.repl.co'
    ];

    // Check if domain is allowed
    const isAllowedDomain = allowedDomains.some(domain => {
      if (domain.startsWith('.')) {
        return host.endsWith(domain);
      }
      return host === domain;
    });

    if (!isAllowedDomain) {
      log(`Domain validation failed for: ${host}`);
      return res.status(403).send(`
        <html>
          <head>
            <title>Domain Configuration Required</title>
            <style>
              body { font-family: system-ui; max-width: 600px; margin: 40px auto; padding: 0 20px; line-height: 1.6; }
              h1 { color: #333; margin-bottom: 1.5em; }
              .message { background: #f8f9fa; padding: 2em; border-radius: 8px; border: 1px solid #dee2e6; }
              .code { background: #f1f3f5; padding: 0.2em 0.4em; border-radius: 3px; font-family: monospace; }
              .steps { margin: 1.5em 0; }
              .step { margin-bottom: 1em; }
              .note { color: #666; font-size: 0.9em; margin-top: 1.5em; }
              .warning { color: #dc3545; }
            </style>
          </head>
          <body>
            <div class="message">
              <h1>Domain Configuration Required</h1>
              <p>To access this site, you need to configure your DNS settings exactly as follows:</p>

              <div class="steps">
                <div class="step">
                  <strong>1. For the root domain (breathwork.fyi):</strong><br>
                  Add an A record:<br>
                  • Name: <span class="code">@</span><br>
                  • Value: <span class="code">35.190.27.27</span>
                </div>

                <div class="step">
                  <strong>2. For the www subdomain (www.breathwork.fyi):</strong><br>
                  Add a CNAME record:<br>
                  • Name: <span class="code">www</span><br>
                  • Value: <span class="code">${replitDomain}</span>
                </div>
              </div>

              <p class="warning">
                <strong>Common Issues:</strong><br>
                • The www CNAME must point to <span class="code">${replitDomain}</span>, not to the IP address<br>
                • Do not use an A record for the www subdomain<br>
                • Remove any existing conflicting DNS records<br>
                • Clear your browser's DNS cache if you recently updated records
              </p>

              <p class="note">
                <strong>Next Steps:</strong><br>
                1. Verify your DNS settings match exactly what's shown above<br>
                2. Wait 15-30 minutes for DNS propagation<br>
                3. Clear your browser's DNS cache<br>
                4. Access the site directly at <a href="https://${replitDomain}">https://${replitDomain}</a> while waiting
              </p>
            </div>
          </body>
        </html>
      `);
    }

    // Handle HTTPS upgrade first
    if (proto !== 'https') {
      const redirectUrl = `https://${host}${req.url}`;
      log(`Redirecting to HTTPS: ${redirectUrl}`);
      return res.redirect(301, redirectUrl);
    }

    // Only redirect www to non-www for the custom domain
    if (host === `www.${customDomain}`) {
      const redirectUrl = `https://${customDomain}${req.url}`;
      log(`Redirecting www to non-www: ${redirectUrl}`);
      return res.redirect(301, redirectUrl);
    }
  }

  next();
});

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