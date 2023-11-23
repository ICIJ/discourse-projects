import { withPluginApi } from "discourse/lib/plugin-api";
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
      return `/categories/${category.id}`;
    },
    forceActive(category, _args, router) {
      return router.currentURL === `/categories/${category.id}`;
    },
  });
}

export default {
  name: "discovery-navigation-subcategories-link",
  initialize() {
    withPluginApi("1.8.0", initialize);
  },
};
