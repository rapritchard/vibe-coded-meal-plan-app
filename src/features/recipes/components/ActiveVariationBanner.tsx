interface ActiveVariationBannerProps {
  text: string;
  onReset: () => void;
}

export function ActiveVariationBanner({
  text,
  onReset,
}: ActiveVariationBannerProps) {
  return (
    <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-3 flex items-center justify-between gap-2">
      <p className="text-xs text-indigo-800 flex-1">{text}</p>
      <button
        onClick={onReset}
        className="text-xs text-indigo-600 underline hover:text-indigo-800"
      >
        Reset
      </button>
    </div>
  );
}
