import { createFileRoute } from "@tanstack/react-router";

import { BlogEditorView } from "@/components/admin/blogs/BlogEditorView";

export const Route = createFileRoute("/super-admin/blogs/$blogId")({
  component: BlogEditPage,
});

function BlogEditPage() {
  const { blogId } = Route.useParams();
  return <BlogEditorView blogId={blogId} />;
}
