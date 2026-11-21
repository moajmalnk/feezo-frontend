import { createFileRoute } from "@tanstack/react-router";

import { BlogSeoChecksView } from "@/components/admin/blogs/BlogSeoChecksView";
import "@/file-routes";

export const Route = createFileRoute("/super-admin/blogs/seo")({
  component: BlogSeoChecksView,
});
