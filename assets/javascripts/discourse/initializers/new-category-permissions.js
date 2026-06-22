import { withPluginApi } from "discourse/lib/plugin-api";
import { i18n } from "discourse-i18n";

/**
 * Ensures a parent/project is selected before a category can be saved.
 *
 * Registers a save-time validator on the core category form (the new
 * validateForm/addError API). Parent-permission inheritance is now handled
 * natively by Discourse core (onParentCategoryChange), so the plugin no longer
 * syncs permissions itself.
 */
function initialize(api) {
  const user = api.getCurrentUser();
  // Only proceed if the user can create categories
  if (!user?.can_create_category) {
    return;
  }

  api.modifyClass(
    "controller:edit-category.tabs",
    (Superclass) =>
      class extends Superclass {
        init() {
          super.init(...arguments);
          // Register a save-time validator wired to the core form's
          // validateForm(data, { addError }) API.
          this.registerValidator(this.validateParentCategory.bind(this));
        }

        get hasParentValidation() {
          return this.siteSettings.projects_category_requires_parent;
        }

        get currentUserIsAdmin() {
          return !!api.getCurrentUser()?.admin;
        }

        validateParentCategory(data, helpers) {
          // Admins may create top-level project categories; only enforce when
          // the site setting requires a parent and the user is not an admin.
          if (!this.hasParentValidation || this.currentUserIsAdmin) {
            return;
          }
          const parentId =
            data?.parent_category_id ?? this.model?.parent_category_id;
          if (parentId) {
            return;
          }
          helpers?.addError?.("parent_category_id", {
            title: i18n("js.category.parent_category"),
            message: i18n("js.subcategory.errors.parent"),
          });
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
