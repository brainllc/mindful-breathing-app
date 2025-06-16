import type { Express } from "express";
import { createServer, type Server } from "http";
import { db, supabase } from "./db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";
import fs from "fs";
import path from "path";

export async function registerRoutes(app: Express): Promise<Server> {
  // Sitemap route handler
  app.get("/sitemap.xml", (req, res) => {
    const sitemapPath = path.join(process.cwd(), "public", "sitemap.xml");
    const readStream = fs.createReadStream(sitemapPath);

    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    res.setHeader("Content-Disposition", "inline; filename=sitemap.xml");

    readStream.pipe(res);

    readStream.on("error", (err) => {
      console.error("Error reading sitemap:", err);
      res.status(500).send("Error reading sitemap");
    });
  });

  app.post("/api/signup", async (req, res, next) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
      }
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) return next(error);

      // Also create user in our public.users table
      if (data.user) {
        await db.insert(users).values({ id: data.user.id, email });
      }

      res.json(data);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/signin", async (req, res, next) => {
    try {
      const { email, password } = req.body;
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) return next(error);
      res.json(data);
    } catch (error) {
      next(error);
    }
  });

  // Example of a protected route
  app.get("/api/me", async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res.status(401).json({ error: "Authorization header is missing" });
      }
      
      const token = authHeader.split(" ")[1];
      if (!token) {
        return res.status(401).json({ error: "Bearer token is missing" });
      }

      const {
        data: { user },
        error,
      } = await supabase.auth.getUser(token);

      if (error || !user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const [appUser] = await db.select().from(users).where(eq(users.id, user.id));

      if (!appUser) {
        return res.status(404).json({ error: "User not found in our database" });
      }

      res.json(appUser);
    } catch (error) {
      next(error);
    }
  });

  // The rest of the routes would be updated similarly,
  // using supabase.auth.getUser() to protect them
  // and using the user id from there to query the database.

  const httpServer = createServer(app);
  return httpServer;
}