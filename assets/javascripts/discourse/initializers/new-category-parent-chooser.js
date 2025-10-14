import { not } from "@ember/object/computed";
import { getOwner } from "@ember/owner";
import { withPluginApi } from "discourse/lib/plugin-api";

/**
 * The role of this initializer is to hide the parent category chooser
 * when creating a new subcategory from a project.
 */
function initialize(api) {
  const user = api.getCurrentUser();
  // Only proceed if the user is a moderator or an admin
  if (!user?.moderator && !user?.admin) {
    return;
  }

  api.modifyClass("component:edit-category-general", {
    pluginId: "discourse-projects",
    get canSelectParentCategory() {
      return !this.isNewSubcategory && not("category.isUncategorizedCategory");
    },
    get isNewSubcategory() {
      const router = getOwner(this).lookup("service:router");
      return router?.currentRoute?.name === "newSubcategory";
    },
  });
}

export default {
  name: "new-category-parent-chooser",
  initialize() {
    withPluginApi(initialize);
  },
};
