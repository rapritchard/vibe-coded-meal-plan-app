import { AuthButton } from "./AuthButton";

export function AppHeader() {
  return (
    <header className="relative border-b-2 border-ink bg-paper px-6 pt-9 pb-6 md:px-10">
      <div className="hidden md:block absolute top-5 right-6">
        <AuthButton variant="light" />
      </div>

      <div className="kicker text-persimmon">Vegetarian · Home cooking</div>

      <h1 className="mt-3 font-serif text-5xl md:text-[5.5rem] font-semibold leading-[0.92] tracking-[-0.02em] text-ink">
        Meal
        <span className="font-light italic"> Planner</span>
        <span className="text-persimmon">.</span>
      </h1>

      <p className="mt-4 font-mono text-[0.7rem] uppercase tracking-[0.18em] text-muted-foreground">
        Plan the week
        <span className="mx-2 text-persimmon">/</span>
        Browse recipes
        <span className="mx-2 text-persimmon">/</span>
        Build a list
      </p>
    </header>
  );
}
