import { getOwner } from "@ember/application";
import { not } from "@ember/object/computed";
import { withPluginApi } from "discourse/lib/plugin-api";

/**
 * The role of this initializer is to hide the parent category chooser
 * when creating a new subcategory from a project.
 */
function initialize(api) {
  api.modifyClass(
    "component:edit-category-general",
    (Superclass) =>
      class extends Superclass {
        get canSelectParentCategory() {
          return (
            !this.isNewSubcategory && not("category.isUncategorizedCategory")
          );
        }

        get isNewSubcategory() {
          const router = getOwner(this).lookup("service:router");
          return router?.currentRoute?.name === "newSubcategory";
        }
      }
  );
}

export default {
  name: "new-category-parent-chooser",
  initialize() {
    withPluginApi("2.1.1", initialize);
  },
};
