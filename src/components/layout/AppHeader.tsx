import { AuthButton } from "./AuthButton";

export function AppHeader() {
  return (
    <div className="bg-stone-900 text-white px-6 pt-10 pb-8 relative">
      <div className="hidden md:block absolute top-4 right-4">
        <AuthButton variant="dark" />
      </div>

      <h1 className="font-serif text-3xl font-bold mb-1">Meal Planner</h1>
      <p className="text-stone-400 text-sm">
        Plan your week, browse recipes, and build a shopping list.
      </p>
    </div>
  );
}
