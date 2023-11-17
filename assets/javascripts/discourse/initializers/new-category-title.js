import Category from "discourse/models/category";
import { withPluginApi } from "discourse/lib/plugin-api";
import { computed } from "@ember/object";

function initialize(api) {

  api.modifyClass("controller:edit-category-tabs", {

    get hasParentCategory() {
      return !!this.parentCategory
    },
    
    @computed('model.parent_category_id')
    get title() {
      return this.hasParentCategory ? this.titleWithCategory : I18n.t("js.category.create")
    },

    @computed('model.parent_category_id')
    get titleWithCategory() {
      const { name: category } = this.parentCategory
      return I18n.t('js.subcategory.create', { category })
    },  

    @computed('model.parent_category_id')
    get titleWithProject() {
      const { name: project } = this.project
      return I18n.t('js.subcategory.create_in_project', { project })
    },

    @computed('model.parent_category_id')
    get parentCategory() {
      return Category.findById(this.model.parent_category_id)
    },

  });
}

export default {
  name: 'new-category-title',
  initialize() {
    withPluginApi("1.8.0", initialize);
  },
};

