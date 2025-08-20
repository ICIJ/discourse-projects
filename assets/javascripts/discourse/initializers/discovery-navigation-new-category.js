import { action } from "@ember/object";
import { service } from "@ember/service";
import { withPluginApi } from "discourse/lib/plugin-api";

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
    withPluginApi("1.8.0", initialize);
  },
};
