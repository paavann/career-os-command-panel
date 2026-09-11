import { createFileRoute } from "@tanstack/react-router";
import { CareerWorkspace } from "@/components/career/CareerWorkspace";

export const Route = createFileRoute("/career")({
  head: () => ({ meta: [
    { title: "C.A.R.E.E.R. Engine | BlueChip Diamond" },
    { name: "description", content: "Assess and strengthen six dimensions of career market power with BlueChip CareerOS Diamond." },
    { property: "og:title", content: "C.A.R.E.E.R. Engine | BlueChip Diamond" },
    { property: "og:description", content: "A private six-pillar career intelligence workspace for BlueChip Diamond members." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: CareerWorkspace,
});