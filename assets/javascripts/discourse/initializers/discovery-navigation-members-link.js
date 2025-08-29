import { withPluginApi } from "discourse/lib/plugin-api";
import Category from "discourse/models/category";
import { i18n } from "discourse-i18n";

/**
 * The role of this initializer is to add a link to the members page
 * of a project in the discovery navigation.
 */
function initialize(api) {
  api.addNavigationBarItem({
    name: "link-to-members",
    displayName: i18n("top_menu.members"),
    customFilter(category) {
      return category && category.is_project;
    },
    customHref(category) {
      return `/c/${Category.slugFor(category)}/members`;
    },
    forceActive(category, _args, router) {
      return router.currentURL === `/c/${Category.slugFor(category)}/members`;
    },
  });
}

export default {
  name: "discovery-navigation-members-link",
  initialize() {
    withPluginApi("2.1.1", initialize);
  },
};
