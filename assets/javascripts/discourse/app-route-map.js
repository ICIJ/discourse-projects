export default function () {
  this.route("projectMembers", {
    path: "/c/*category_slug_path_with_id/members",
  });
  this.route("projects");
  this.route("projectsNewCategory", { path: "/categories/new" });
}
