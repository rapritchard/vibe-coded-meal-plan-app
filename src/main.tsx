// ─────────────────────────────────────────────────────────────────────────────
// src/main.tsx
// React DOM root mount. Vite uses this as the entry point.
// ─────────────────────────────────────────────────────────────────────────────

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";

const root = document.getElementById("root");
if (!root) throw new Error("Root element #root not found in index.html");

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>
);
