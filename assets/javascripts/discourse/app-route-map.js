export default function () {
  this.route("newSubcategory", { path: "/new-subcategory/:category_id" });
  this.route("subcategories", { path: "/c/*category_slug/categories" });
  this.route("members", { path: "/c/*category_slug/members" });
  this.route("projects", { path: "/projects" });
}
