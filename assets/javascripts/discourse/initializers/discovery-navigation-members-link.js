import { withPluginApi } from "discourse/lib/plugin-api";
import Category from "discourse/models/category";
import I18n from "I18n";

function initialize(api) {
  api.addNavigationBarItem({
    name: "link-to-members",
    displayName: I18n.t("top_menu.members"),
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
    withPluginApi("1.8.0", initialize);
  },
};
