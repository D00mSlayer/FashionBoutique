import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { initializeAnalytics } from "./lib/analytics";

// Initialize Google Analytics
const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;
if (GA_MEASUREMENT_ID) {
  initializeAnalytics(GA_MEASUREMENT_ID);
}

createRoot(document.getElementById("root")!).render(<App />);