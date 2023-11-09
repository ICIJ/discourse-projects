export default function () {
  this.route("newSubcategory", { path: "/new-category" });
  this.route("newSubcategory", { path: "/new-subcategory/:parent" });
}