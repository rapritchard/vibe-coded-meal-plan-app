import { createFileRoute, useNavigate } from "@tanstack/react-router";

import { RecipeModal } from "@/features/recipes/components/RecipeModal";
import { useAppData } from "@/hooks/use-app-data";

// Deep-linkable recipe modal. Renders over the catalog (the /recipes layout
// stays mounted). Only cooking recipes have a modal view; other catalog kinds
// render self-contained cards, so an unknown slug simply shows nothing.
export const Route = createFileRoute("/recipes/$slug")({
  component: RecipeModalRoute,
});

function RecipeModalRoute() {
  const { slug } = Route.useParams();
  const navigate = useNavigate();
  const { recipes } = useAppData();

  const recipe = recipes.find((r) => r.slug === slug) ?? null;

  return (
    <RecipeModal
      recipe={recipe}
      onClose={() =>
        // Return to the catalog, preserving the active filters in the URL.
        navigate({ to: "/recipes", search: (prev) => prev })
      }
    />
  );
}
