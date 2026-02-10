import { getOwner } from "@ember/owner";
import { apiInitializer } from "discourse/lib/api";
import getURL from "discourse/lib/get-url";

/**
 * When `projects_limit_latest_to_category` is enabled and we're viewing a
 * category's subcategories page, rewrite the "More" link at the bottom of
 * the latest topic list to point to the category-scoped latest page
 * (e.g. /c/aladdin/42/l/latest) instead of the global /latest.
 *
 * CategoriesTopicList is a classic Ember component, so we can use
 * `modifyClass` with `didRender` to rewrite the link after each render.
 * Even though CategoriesAndLatestTopics imports CategoriesTopicList via
 * a static ES module import, `reopen` modifies the class prototype
 * in-place, so the modification applies everywhere.
 */
function initialize(api) {
  const siteSettings = api.container.lookup("service:site-settings");
  // Only apply this behavior if the setting is enabled.
  if (!siteSettings.projects_limit_latest_to_category) {
    return;
  }

  api.modifyClass("component:categories-topic-list", {
    pluginId: "discourse-projects",

    didRender() {
      this._super(...arguments);

      const owner = getOwner(this);
      const route = owner.lookup("route:discovery.subcategories");
      const moreLink = this.element?.querySelector(".more-topics a");
      const parentCategory = route?.controller?.model?.parentCategory;

      // No parent category means we're not on a subcategories page, so we can skip the rest of the logic.
      // The more link may not be present if there are fewer topics than the threshold for showing the link,
      // so we also check for its existence before trying to modify it.
      if (!parentCategory || !moreLink) {
        return;
      }

      // Finnally, rewrite the "More" link to point to the category-scoped latest page.
      moreLink.href = getURL(
        `/c/${parentCategory.slug}/${parentCategory.id}/l/latest`
      );
    },
  });
}

export default apiInitializer(initialize);
