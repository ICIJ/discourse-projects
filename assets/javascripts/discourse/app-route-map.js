export default function () {
  this.route("newSubcategory", { path: "/new-subcategory/:parent" });
  this.route("subcategories", { path: "/c/*slug/categories" });
  this.route("projects", { path: "/projects" });
}
