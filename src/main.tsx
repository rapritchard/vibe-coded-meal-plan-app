// ─────────────────────────────────────────────────────────────────────────────
// src/main.tsx
// React DOM root mount + TanStack Router setup. Vite uses this as the entry
// point. Providers wrap the RouterProvider so route components can read auth,
// ratings, notes, and the app data catalog via their hooks.
// ─────────────────────────────────────────────────────────────────────────────

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createRouter, RouterProvider } from "@tanstack/react-router";

import "./index.css";
import { routeTree } from "./routeTree.gen";
import { AuthProvider } from "./hooks/use-auth";
import { NotesProvider } from "./hooks/use-notes";
import { RatingsProvider } from "./hooks/use-ratings";
import { AppDataProvider } from "./hooks/use-app-data";

const router = createRouter({ routeTree });

// Register the router instance for full type-safety on Link/navigate/search.
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const root = document.getElementById("root");
if (!root) throw new Error("Root element #root not found in index.html");

createRoot(root).render(
  <StrictMode>
    <AuthProvider>
      <RatingsProvider>
        <NotesProvider>
          <AppDataProvider>
            <RouterProvider router={router} />
          </AppDataProvider>
        </NotesProvider>
      </RatingsProvider>
    </AuthProvider>
  </StrictMode>,
);
