import { withPluginApi } from "discourse/lib/plugin-api";
import I18n from "I18n";

function initialize(api) {
  api.addNavigationBarItem({
    name: "link-to-subcategories",
    displayName: I18n.t("top_menu.subcategories"),
    before: "posted",
    customFilter (category, args, router) { 
      return category !== null && typeof category !== "undefined" && category.has_children
    },
    customHref (category, args, router) {  
      return `/categories/${category.id}`; 
    },
    forceActive (category, args, router) {
      return  router.currentURL === `/categories/${category.id}`
    }
  })
}

export default {
  name: "discovery-navigation-subcategories-link",
  initialize() {
    withPluginApi("1.8.0", initialize);
  },
};
