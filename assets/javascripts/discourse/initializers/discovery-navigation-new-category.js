import { action } from "@ember/object";
import { service } from "@ember/service";
import { withPluginApi } from "discourse/lib/plugin-api";

/**
 * The role of this initializer is to override the createCategory method
 * in the discovery navigation component to display a modal when creating a
 * new category. This modal prompts the user to select a project in which
 * to create the category.
 */
function initialize(api) {
  api.modifyClass(
    "component:discovery/navigation",
    (Superclass) =>
      class extends Superclass {
        @service project;
        @service newSubcategoryModal;

        @action
        async createCategory() {
          return this.newSubcategoryModal.create(this.args.category);
        }
      }
  );
}

export default {
  name: "discovery-navigation-new-category",
  initialize() {
    withPluginApi(initialize);
  },
};
