import { getOwner } from "@ember/application";
import { not } from "@ember/object/computed";
import  EditCategoryGeneral from 'discourse/components/edit-category-general';
import { withPluginApi } from "discourse/lib/plugin-api";

function initialize(api) {
  EditCategoryGeneral.reopen({
    get canSelectParentCategory() {
      return !this.isNewSubcategory && not("category.isUncategorizedCategory");
    },
    get isNewSubcategory() {
      return getOwner(this).lookup('router:main')?.currentRoute?.name === 'newSubcategory';
    }
  });
}

export default {
  name: 'new-category-parent-chooser',
  initialize() {
    withPluginApi("1.8.0", initialize);
  },
};

