export default function () {
  this.route("newSubcategory", { path: "/new-subcategory/:parent" });
  this.route("subcategories", { path: "/categories/:parent" });
  this.route("projects", { path: "/projects" });
}
