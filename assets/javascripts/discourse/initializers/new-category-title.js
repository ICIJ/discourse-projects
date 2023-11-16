import Category from "discourse/models/category";
import { withPluginApi } from "discourse/lib/plugin-api";
import { observes, on } from "discourse-common/utils/decorators";
import { computed } from "@ember/object";
import { ajax } from "discourse/lib/ajax";

function initialize(api) {


  api.modifyClass("controller:edit-category-tabs", {
    pluginId: 'projects',

    @observes("model.parent_category_id")
    async onParentCategoryChange() {
      if(this.model.parent_category_id) {
        const groupPermissions = await getCategoryGroupPermissions(this.model.parent_category_id);
        // This ensure we do not cumulate new permissions with the existing one
        this.model.permissions.clear();
        // Then we add each permission one by one to ensure
        // the set is used correctly
        groupPermissions.forEach((permission) => {
          this.model.addPermission(permission);
        });
      }
    },

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
      const project = this.project
      return I18n.t('js.subcategory.create', { category })
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

