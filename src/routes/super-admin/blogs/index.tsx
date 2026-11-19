import { createFileRoute } from "@tanstack/react-router";

import { BlogsView } from "@/components/admin/blogs/BlogsView";

export const Route = createFileRoute("/super-admin/blogs/")({
  component: BlogsView,
});
