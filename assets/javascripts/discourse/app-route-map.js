export default function () {
  this.route("newSubcategory", { path: "/new-subcategory/:category_id" });
  this.route("projectMembers", {
    path: "/c/*category_slug_path_with_id/members",
  });
  this.route("projects");
}
