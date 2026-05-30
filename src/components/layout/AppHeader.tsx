import { AuthButton } from "./AuthButton";

const HEADER_BADGES = [
  "Gut-gentle",
  "Protein-focused",
  "3-week rotation",
  "Ninja-ready",
  "Custom week",
];

export function AppHeader() {
  return (
    <div className="bg-stone-900 text-white px-6 pt-10 pb-8 relative">
      <div className="hidden md:block absolute top-4 right-4">
        <AuthButton variant="dark" />
      </div>

      <div className="text-xs tracking-[0.2em] text-stone-400 uppercase mb-2">
        Recovery eating
      </div>
      <h1 className="font-serif text-3xl font-bold mb-1">Phase 1 Meal Plan</h1>
      <p className="text-stone-400 text-sm">
        Post-cholecystectomy · Vegetarian · Low fat · Gut-first
      </p>
      <div className="flex flex-wrap gap-2 mt-4">
        {HEADER_BADGES.map((badge) => (
          <span
            key={badge}
            className="text-xs bg-stone-800 text-stone-300 px-3 py-1 rounded-full"
          >
            {badge}
          </span>
        ))}
      </div>
    </div>
  );
}
