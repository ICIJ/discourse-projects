import { computed } from "@ember/object";
import { withPluginApi } from "discourse/lib/plugin-api";
import Category from "discourse/models/category";
import I18n from "I18n";

function initialize(api) {

  api.modifyClass("controller:edit-category-tabs", {
    pluginId: "projects",

    get hasParentCategory() {
      return !!this.parentCategory;
    },

    @computed('model.parent_category_id')
    get title() {
      if (!this.project) {
        return I18n.t("js.category.create");
      }
      if (this.project.id === this.parentCategory.id) {
        return this.titleWithProject;
      }
      return this.titleWithCategory;
    },

    @computed('model.parent_category_id')
    get titleWithCategory() {
      const { name: category, project: { name: project } } = this.parentCategory;
      return I18n.t('js.subcategory.create', { category, project });
    },

    @computed('model.parent_category_id')
    get titleWithProject() {
      const { name: project } = this.project;
      return I18n.t('js.subcategory.create_in_project', { project });
    },

    @computed('model.parent_category_id')
    get parentCategory() {
      return Category.findById(this.model.parent_category_id);
    },

    @computed('model.parent_category_id')
    get project() {
      if (this.parentCategory?.is_project) {
        return this.parentCategory;
      }
      return this.parentCategory?.project;
    },

  });
}

export default {
  name: 'new-category-title',
  initialize() {
    withPluginApi("1.8.0", initialize);
  },
};

