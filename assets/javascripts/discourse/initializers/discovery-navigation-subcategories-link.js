import { withPluginApi } from "discourse/lib/plugin-api";
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
      const slug = category.path.split("/c/").pop();
      return `/c/${slug}/subcategories`;
    },
    forceActive(category, _args, router) {
      const slug = category.path.split("/c/").pop();
      const href = `/c/${slug}/subcategories`;
      return router.currentURL === href;
    },
  });
}

export default {
  name: "discovery-navigation-subcategories-link",
  initialize() {
    withPluginApi(initialize);
  },
};
