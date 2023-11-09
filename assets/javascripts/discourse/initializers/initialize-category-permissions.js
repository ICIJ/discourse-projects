import { withPluginApi } from "discourse/lib/plugin-api";
import { observes, on } from "discourse-common/utils/decorators";
import { ajax } from "discourse/lib/ajax";

function initialize(api) {

  async function getCategoryGroupPermissions(categoryId) {
    const { category } = await ajax(`/c/${categoryId}/show.json`);
    return category.group_permissions;
  }

  api.modifyClass("controller:edit-category-tabs", {
    pluginId: 'projects',

    @on("init")
    _initPanels() {
      this._super(...arguments);
      this.actions.registerValidator.call(this, this.validateParentCategory.bind(this));
    },

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

    get site() {
      return api.container.lookup("site:main");
    },

    get hasParentCategory() {
      return this.categoryExists(this.model.parent_category_id);
    },

    get hasParentValidation() {
      return this.siteSettings.projects_category_requires_parent
    },

    get currentUserIsAdmin() {
      return api.getCurrentUser().admin;
    },

    validateParentCategory() {
      // This valid
      if (!this.hasParentValidation || this.hasParentCategory || this.currentUserIsAdmin) {
        return false;
      }
      // This invalid
      this.dialog.alert(I18n.t('js.subcategory.errors.parent'));
      return true;
    },

    categoryExists(categoryId) {
      return this.site.categories.some(({ id }) => id === categoryId);
    }
  });
}

export default {
  initialize() {
    withPluginApi("1.8.0", initialize);
  },
};

