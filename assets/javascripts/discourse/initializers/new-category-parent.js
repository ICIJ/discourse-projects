import { service } from "@ember/service";
import { ajax } from "discourse/lib/ajax";
import { withPluginApi } from "discourse/lib/plugin-api";
import Site from "discourse/models/site";

/**
 * Injects a parent category into the record built by the core `newCategory`
 * route. The parent id is stashed on the project service by the
 * "new subcategory" entry points. We load the parent so we can copy its group
 * permissions onto the new category and register it as loaded (avoids the
 * CategoryChooser re-async-loading it under FormKit's read-only @transientData
 * binding).
 */
function initialize(api) {
  api.modifyClass(
    "route:new-category",
    (Superclass) =>
      class extends Superclass {
        @service project;
        @service newSubcategoryModal;

        activate() {
          super.activate(...arguments);
          document.body.classList.add("projects-new-category");
        }

        deactivate() {
          super.deactivate(...arguments);
          document.body.classList.remove("projects-new-category");
        }

        beforeModel(transition) {
          const redirect = super.beforeModel(...arguments);
          if (redirect) {
            return redirect;
          }
          // Always require a parent/project for new categories. If the user
          // reached the creator without one stashed (direct URL, sidebar, core
          // "new category" button), force the project-picker modal — for every
          // user, regardless of the requires-parent setting.
          if (!this.project?.pendingParentCategoryId) {
            transition.abort();
            this.newSubcategoryModal.create();
          }
        }

        async model() {
          const model = await super.model(...arguments);

          const parentId = this.project?.pendingParentCategoryId;
          if (!parentId) {
            return model;
          }
          // Consume the stash once, before awaiting, to avoid double-injection.
          this.project.pendingParentCategoryId = null;

          try {
            const id = parseInt(parentId, 10);
            const { category } = await ajax(`/c/${id}/show.json`);
            Site.current().updateCategory(category);
            const ids = Site.current().loadedCategoryIds || new Set();
            ids.add(id);
            Site.current().set("loadedCategoryIds", ids);
            model.set("parent_category_id", id);
            if (category?.group_permissions) {
              model.set("group_permissions", category.group_permissions);
            }
          } catch {
            // If the parent can't be loaded, fall back to a top-level category.
            // eslint-disable-next-line no-console
            console.warn(
              "[discourse-projects] failed to load parent category; creating a top-level category"
            );
          }

          return model;
        }
      }
  );
}

export default {
  name: "new-category-parent",
  initialize() {
    withPluginApi(initialize);
  },
};
