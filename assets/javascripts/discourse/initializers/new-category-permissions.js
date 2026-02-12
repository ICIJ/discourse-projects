import { action } from "@ember/object";
import { next } from "@ember/runloop";
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

  api.modifyClass(
    "controller:edit-category.tabs",
    (Superclass) =>
      class extends Superclass {
        transientParentCategoryId = null;

        init() {
          super.init(...arguments);
          // Register the validator to ensure the parent category is valid
          const validator = this.validateParentCategory.bind(this);
          this.actions.registerValidator.call(this, validator);
        }

        setTransientParentCategoryId(parentCategoryId) {
          this.set("transientParentCategoryId", parentCategoryId);
          // We need to wait for the transientParentCategoryId to be set before we can update
          // the permissions so we use next to ensure it runs in the next run loop.
          next(this.setCategoryPermissions.bind(this));
        }

        /**
         * When the parent category is changed, we need to update the permissions of the new category
         * to match the new parent category. To do this, we set a transient parent category id
         * that will be used to fetch the permissions of the new parent category and update the
         * permissions of the new category accordingly.
         *
         * This is necessary because when we change the parent category, the model is not immediately updated
         * with the new parent category id, so we need to use a transient value to keep track of the new parent
         * category id until the model is updated.
         *
         * Unfortunately, there is no hook that we can use to detect when the parent category is changed,
         * so we need to override the canSaveForm action to detect when the parent category.
         */
        @action
        canSaveForm(transientData) {
          if (transientData.parent_category_id !== this.parentCategoryId) {
            this.setTransientParentCategoryId(transientData.parent_category_id);
          }
          return super.canSaveForm(transientData);
        }

        async getCategoryGroupPermissions() {
          try {
            const { category } = await ajax(
              `/c/${this.parentCategoryId}/show.json`
            );
            return category?.group_permissions ?? [];
          } catch {
            return [];
          }
        }

        async setCategoryPermissions() {
          if (!this.parentCategoryId) {
            return;
          }

          const groupPermissions = await this.getCategoryGroupPermissions();
          // Sometimes we can have a parent category but no permissions, in
          // that case we do not want to do anything
          if (!groupPermissions.length) {
            return;
          }
          // This ensure we do not cumulate new permissions with the existing one
          this.model.permissions.clear();
          // Then we add each permission one by one to ensure
          // the set is used correctly
          groupPermissions.forEach(this.model.addPermission.bind(this.model));
        }

        get hasParentCategory() {
          return !!this.parentCategoryId;
        }

        get hasParentValidation() {
          return this.siteSettings.projects_category_requires_parent;
        }

        get currentUserIsAdmin() {
          return !!api.getCurrentUser()?.admin;
        }

        get parentCategory() {
          return Category.findById(this.parentCategoryId);
        }

        get parentCategoryId() {
          return (
            this.transientParentCategoryId ?? this.model.parent_category_id
          );
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
