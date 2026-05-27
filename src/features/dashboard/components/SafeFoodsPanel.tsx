const SAFE_FOODS = [
  "Crumpets with butter & banana",
  "Tortellini with lighter four cheese sauce",
  "Banana — daily, especially if on antibiotics",
  "Mini overnight oat pots — for medication mornings",
  "Strawberry trifle — comfort dessert",
  "Dark chocolate mousse — treat without guilt",
];

export function SafeFoodsPanel() {
  return (
    <div className="bg-rose-50 border border-rose-100 rounded-2xl p-5">
      <div className="font-bold text-rose-900 mb-2">
        Safe foods — always available
      </div>
      {SAFE_FOODS.map((f) => (
        <div key={f} className="text-sm text-rose-800">
          + {f}
        </div>
      ))}
    </div>
  );
}
