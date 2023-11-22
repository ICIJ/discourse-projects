import { computed } from "@ember/object";
import Category from "discourse/models/category";
import I18n from "I18n";
import CategoryDrop from "select-kit/components/category-drop";

const NO_PROJECTS = "no-projects";

export default CategoryDrop.extend({
  pluginApiIdentifiers: ["project-dropdown"],
  classNames: "project-dropdown",

  content: computed(function () {
    const none = {
      id: NO_PROJECTS,
      name: this.noneLabel,
      title: this.noneLabel,
      value: NO_PROJECTS,
      label: this.noneLabel,
    };
    const projects = Category.list().filter((c) => c.is_project);
    return this.hasSelectedCategory ? [none, ...projects] : projects;
  }),
  selectKitOptions: {
    none: "project_dropdown.none",
  },
  get hasSelectedCategory() {
    return this.category !== null && typeof this.category !== "undefined";
  },

  allCategoriesLabel: computed(
    "parentCategoryName",
    "selectKit.options.subCategory",
    function () {
      if (this.editingCategory) {
        return this.noCategoriesLabel;
      }
      if (this.selectKit.options.subCategory) {
        return I18n.t("categories.all_subcategories", {
          categoryName: this.parentCategoryName,
        });
      }
      return this.noneLabel;
    }
  ),

  get noneLabel() {
    return I18n.t(
      this.hasSelectedCategory
        ? "js.project_dropdown.none"
        : "js.project_dropdown.select"
    );
  },
});
