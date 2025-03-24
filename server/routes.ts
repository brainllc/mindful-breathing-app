import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertSessionSchema } from "@shared/schema";
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

  app.post("/api/users", async (req, res) => {
    const parsed = insertUserSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error });
    }
    const user = await storage.createUser(parsed.data);
    res.json(user);
  });

  app.get("/api/users/:id", async (req, res) => {
    const user = await storage.getUser(Number(req.params.id));
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  });

  app.post("/api/sessions", async (req, res) => {
    const parsed = insertSessionSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error });
    }
    const session = await storage.createSession(parsed.data);
    res.json(session);
  });

  app.get("/api/users/:id/sessions", async (req, res) => {
    const sessions = await storage.getSessionsByUser(Number(req.params.id));
    res.json(sessions);
  });

  app.patch("/api/users/:id/progress", async (req, res) => {
    const { exercise, rounds } = req.body;
    if (!exercise || !rounds) {
      return res.status(400).json({ error: "Missing exercise or rounds" });
    }
    const user = await storage.updateUserProgress(
      Number(req.params.id),
      exercise,
      rounds
    );
    res.json(user);
  });

  const httpServer = createServer(app);
  return httpServer;
}