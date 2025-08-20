import { getOwner } from "@ember/application";
import { not } from "@ember/object/computed";
import { withPluginApi } from "discourse/lib/plugin-api";

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
    withPluginApi("1.8.0", initialize);
  },
};
