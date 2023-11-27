import Category from "discourse/models/category";
import CategoryChooserComponent from "select-kit/components/category-chooser";
import iteratee from "../helpers/iteratee";

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
    return Category.list().filter(iteratee("is_project"));
  },
});
