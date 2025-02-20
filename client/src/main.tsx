import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Create a separate chunk for the app
const root = createRoot(document.getElementById("root")!);

// Hydrate the app with React 18's createRoot
root.render(<App />);

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