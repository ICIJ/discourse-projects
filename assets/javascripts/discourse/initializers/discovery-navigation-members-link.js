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
      const { id = null } = category || {};
      const slug = Category.slugFor(category);
      return slug && id ? `/c/${slug}/${id}/members` : null;
    },
    forceActive(category, _args, router) {
      const { currentURL } = router;
      const { id = null } = category || {};
      const slug = Category.slugFor(category);
      return (
        currentURL === `/c/${slug}/${id}/members` ||
        currentURL === `/c/${slug}/members`
      );
    },
  });
}

export default {
  name: "discovery-navigation-members-link",
  initialize() {
    withPluginApi(initialize);
  },
};
