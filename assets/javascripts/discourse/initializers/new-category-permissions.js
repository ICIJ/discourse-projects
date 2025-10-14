import { computed } from "@ember/object";
import { observes } from "@ember-decorators/object";
import { ajax } from "discourse/lib/ajax";
import { withPluginApi } from "discourse/lib/plugin-api";
import Category from "discourse/models/category";
import { i18n } from "discourse-i18n";

/**
 * The role of this initializer is to manage the permissions
 * for new categories and subcategories. It ensures that
 * the correct permissions are set based on the parent category.
 */
function initialize(api) {
  const user = api.getCurrentUser();
  // Only proceed if the user is a moderator or an admin
  if (!user?.moderator && !user?.admin) {
    return;
  }

  async function getCategoryGroupPermissions(categoryId) {
    const { category } = await ajax(`/c/${categoryId}/show.json`);
    return category.group_permissions;
  }

  api.modifyClass(
    "route:new-category",
    (Superclass) =>
      class extends Superclass {
        setupController(controller, model, transition) {
          super.setupController(controller, model, transition);
          // This is to ensure that when we create a new category
          // with a parent category, the permissions
          // are updated accordingly.
          return controller.setCategoryPermissions();
        }
      }
  );

  api.modifyClass(
    "controller:edit-category.tabs",
    (Superclass) =>
      class extends Superclass {
        init() {
          super.init(...arguments);
          // Register the validator to ensure the parent category is valid
          const validator = this.validateParentCategory.bind(this);
          this.actions.registerValidator.call(this, validator);
        }

        // This observer current doesnt work. That means that if you change
        // the parent category, the permissions are not updated accordingly.
        // We need to find a way to make it work. For now, the permissions
        // are only set when the controller is initialized.
        @observes("model.parent_category_id")
        onParentCategoryChange() {
          return this.setCategoryPermissions();
        }

        async setCategoryPermissions() {
          if (!this.model.parent_category_id) {
            return;
          }

          const groupPermissions = await getCategoryGroupPermissions(
            this.model.parent_category_id
          );
          // This ensure we do not cumulate new permissions with the existing one
          this.model.permissions.clear();
          // Then we add each permission one by one to ensure
          // the set is used correctly
          groupPermissions.forEach(this.model.addPermission.bind(this.model));
        }

        get hasParentCategory() {
          return !!this.parentCategory;
        }

        get hasParentValidation() {
          return this.siteSettings.projects_category_requires_parent;
        }

        get currentUserIsAdmin() {
          return !!api.getCurrentUser()?.admin;
        }

        @computed("model.parent_category_id")
        get parentCategory() {
          return Category.findById(this.model.parent_category_id);
        }

        validateParentCategory() {
          // If we don't need to validate the parent category, or if we have one,
          // or if the user is an admin then everything is fine.
          if (
            !this.hasParentValidation ||
            this.hasParentCategory ||
            this.currentUserIsAdmin
          ) {
            return false;
          }
          this.dialog.alert(i18n("js.subcategory.errors.parent"));
          return true;
        }
      }
  );
}

export default {
  name: "new-category-permissions",
  initialize() {
    withPluginApi(initialize);
  },
};
