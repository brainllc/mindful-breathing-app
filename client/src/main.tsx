import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

console.log("🚀 main.tsx: Starting app initialization...");
console.log("🔍 main.tsx: Current URL:", window.location.href);
console.log("🔍 main.tsx: Has OAuth tokens?", window.location.hash.includes("access_token"));

// Create a separate chunk for the app
const root = createRoot(document.getElementById("root")!);

// Hydrate the app with React 18's createRoot
console.log("🚀 main.tsx: Rendering React app...");
root.render(<App />);
console.log("✅ main.tsx: React app rendered successfully");

// Preload critical routes
const preloadRoutes = () => {
  // Preload home page
  const preloadHome = () => import("./pages/Home");
  // Preload exercise page after home is loaded
  const preloadExercise = () => import("./pages/Exercise");

  requestIdleCallback(() => {
    preloadHome();
    requestIdleCallback(preloadExercise);
  });
};

// Start preloading routes when the browser is idle
if ("requestIdleCallback" in window) {
  requestIdleCallback(preloadRoutes);
} else {
  // Fallback for browsers that don't support requestIdleCallback
  setTimeout(preloadRoutes, 1000);
}