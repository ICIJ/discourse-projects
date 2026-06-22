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

        validateParentCategory(data, helpers) {
          // Enforce on NEW category creation only — editing an existing
          // category (including a top-level project, which has no parent) must
          // not be blocked. New records created via store.createRecord have no id.
          if (this.model?.id) {
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
