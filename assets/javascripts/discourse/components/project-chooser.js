import CategoryChooserComponent from "select-kit/components/category-chooser";
import Category from "discourse/models/category";

export default CategoryChooserComponent.extend({
  pluginApiIdentifiers: ["project-chooser"],
  classNames: ["project-chooser"],
  services: ["site"],

  selectKitOptions: {
    displayCategoryDescription: true,
    caretDownIcon: "caret-down",
    caretUpIcon: "caret-up",
  },
  get content() {
    return Category.list().filter((c) => c.is_project);
  },
});
