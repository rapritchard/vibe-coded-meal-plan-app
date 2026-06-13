import { createFileRoute } from "@tanstack/react-router";

import ReviewTab from "@/features/review/ReviewTab";
import { useAppData } from "@/hooks/use-app-data";

export const Route = createFileRoute("/review")({
  component: ReviewPage,
});

function ReviewPage() {
  const { allItems } = useAppData();
  return <ReviewTab items={allItems} />;
}
