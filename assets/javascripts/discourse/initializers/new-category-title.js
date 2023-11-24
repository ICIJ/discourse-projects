import { computed } from "@ember/object";
import { withPluginApi } from "discourse/lib/plugin-api";
import Category from "discourse/models/category";
import I18n from "I18n";

function initialize(api) {
  api.modifyClass("controller:edit-category-tabs", {
    pluginId: "new-category-title",

    get hasParentCategory() {
      return !!this.parentCategory;
    },

    @computed("model.parent_category_id")
    get title() {
      if (!this.project) {
        const categoryName = this.model.name;
        const localeMessage = categoryName
          ? "js.category.edit"
          : "js.category.create";
        return I18n.t(localeMessage, { categoryName });
      }
      if (this.project.id === this.parentCategory.id) {
        return this.titleWithProject;
      }
      return this.titleWithCategory;
    },

    @computed("model.parent_category_id")
    get titleWithCategory() {
      const {
        name: categoryName,
        project: { name: projectName },
      } = this.parentCategory;
      return I18n.t("js.subcategory.create", { categoryName, projectName });
    },

    @computed("model.parent_category_id")
    get titleWithProject() {
      const { name: projectName } = this.project;
      return I18n.t("js.subcategory.create_in_project", { projectName });
    },

    @computed("model.parent_category_id")
    get parentCategory() {
      return Category.findById(this.model.parent_category_id);
    },

    @computed("model.parent_category_id")
    get project() {
      if (this.parentCategory?.is_project) {
        return this.parentCategory;
      }
      return this.parentCategory?.project;
    },
  });
}

export default {
  name: "new-category-title",
  initialize() {
    withPluginApi("1.8.0", initialize);
  },
};
