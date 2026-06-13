import { createFileRoute } from "@tanstack/react-router";

// The bare /recipes view renders only the catalog (in the layout route). No
// modal overlay, so this index route renders nothing.
export const Route = createFileRoute("/recipes/")({
  component: () => null,
});
