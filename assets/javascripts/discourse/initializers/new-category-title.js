import { computed } from "@ember/object";
import { htmlSafe } from "@ember/template";
import { withPluginApi } from "discourse/lib/plugin-api";
import Category from "discourse/models/category";
import { i18n } from "discourse-i18n";
import { projectLinkHTML } from "../helpers/project-link";

/**
 * The role of this initializer is to manage the title
 * of new categories and subcategories page, based on their
 * parent category.
 */
function initialize(api) {
  api.modifyClass(
    "controller:edit-category-tabs",
    (Superclass) =>
      class extends Superclass {
        get hasParentCategory() {
          return !!this.parentCategory;
        }

        @computed("model.parent_category_id")
        get title() {
          if (!this.project) {
            const categoryName = this.model.name;
            const localeMessage = categoryName
              ? "js.category.edit"
              : "js.category.create";
            return i18n(localeMessage, { categoryName });
          }
          if (this.project.id === this.parentCategory.id) {
            return this.titleWithProject;
          }
          return this.titleWithCategory;
        }

        @computed("model.parent_category_id")
        get titleWithCategory() {
          const { name: categoryName } = this.parentCategory;
          const projectLink = projectLinkHTML(this.project);
          return htmlSafe(
            i18n("js.subcategory.create", { categoryName, projectLink })
          );
        }

        @computed("model.parent_category_id")
        get titleWithProject() {
          const { name: projectName } = this.project;
          const projectLink = projectLinkHTML(this.project);
          return htmlSafe(
            i18n("js.subcategory.create_in_project", {
              projectName,
              projectLink,
            })
          );
        }

        @computed("model.parent_category_id")
        get parentCategory() {
          return Category.findById(this.model.parent_category_id);
        }

        @computed("model.parent_category_id")
        get project() {
          if (this.parentCategory?.is_project) {
            return this.parentCategory;
          }
          return this.parentCategory?.project;
        }
      }
  );
}

export default {
  name: "new-category-title",
  initialize() {
    withPluginApi("2.1.1", initialize);
  },
};
