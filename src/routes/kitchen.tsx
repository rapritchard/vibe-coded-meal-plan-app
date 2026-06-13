import { createFileRoute } from "@tanstack/react-router";

import StoresTab from "@/features/stores/StoresTab";

export const Route = createFileRoute("/kitchen")({
  component: StoresTab,
});
