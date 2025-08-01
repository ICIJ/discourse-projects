import { withPluginApi } from "discourse/lib/plugin-api";
import Category from "discourse/models/category";
import { i18n } from "discourse-i18n";

function initialize(api) {
  api.addNavigationBarItem({
    name: "link-to-subcategories",
    displayName: i18n("top_menu.subcategories"),
    before: "posted",
    customFilter(category) {
      return (
        category !== null &&
        typeof category !== "undefined" &&
        category.has_children
      );
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
    withPluginApi("1.8.0", initialize);
  },
};
