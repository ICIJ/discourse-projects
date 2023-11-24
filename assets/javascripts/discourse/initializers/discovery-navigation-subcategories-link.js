import { withPluginApi } from "discourse/lib/plugin-api";
import Category from "discourse/models/category";
import I18n from "I18n";

function initialize(api) {
  api.addNavigationBarItem({
    name: "link-to-subcategories",
    displayName: I18n.t("top_menu.subcategories"),
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
