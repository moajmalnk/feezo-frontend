import { createFileRoute } from "@tanstack/react-router";

import { BlogIndexPage } from "@/components/marketing/blog/BlogIndexPage";

export const Route = createFileRoute("/blog/")({
  component: BlogIndexPage,
});
