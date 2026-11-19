import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/super-admin/blogs")({
  component: BlogsLayout,
});

function BlogsLayout() {
  return <Outlet />;
}
