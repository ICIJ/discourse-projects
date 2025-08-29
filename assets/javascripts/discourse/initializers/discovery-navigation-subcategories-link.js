import { withPluginApi } from "discourse/lib/plugin-api";
import Category from "discourse/models/category";
import { i18n } from "discourse-i18n";

/**
 * The role of this initializer is to add a link to the subcategories page
 * of a project category in the discovery navigation.
 */
function initialize(api) {
  api.addNavigationBarItem({
    name: "link-to-subcategories",
    displayName: i18n("top_menu.subcategories"),
    before: "posted",
    customFilter(category) {
      return !!category;
    },
    customHref(category) {
      return `/c/${Category.slugFor(category)}/categories`;
    },
    forceActive(category, _args, router) {
      return (
        router.currentURL === `/c/${Category.slugFor(category)}/categories`
      );
    },
  });
}

export default {
  name: "discovery-navigation-subcategories-link",
  initialize() {
    withPluginApi("2.1.1", initialize);
  },
};
