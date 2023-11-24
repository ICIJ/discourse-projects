export default function () {
  this.route("newSubcategory", { path: "/new-subcategory/:parent" });
  this.route("subcategories", { path: "/c/*slug/categories" });
  this.route("members", { path: "/c/*slug/members" });
  this.route("projects", { path: "/projects" });
}
