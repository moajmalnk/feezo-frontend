import { createFileRoute } from "@tanstack/react-router";

import { BlogEditorView } from "@/components/admin/blogs/BlogEditorView";

export const Route = createFileRoute("/super-admin/blogs/new")({
  component: () => <BlogEditorView />,
});
