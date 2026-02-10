import { apiInitializer } from "discourse/lib/api";
import getURL from "discourse/lib/get-url";

/**
 * When `projects_limit_latest_to_category` is enabled and we're viewing a
 * category's subcategories page, rewrite the "More" link at the bottom of
 * the latest topic list to point to the category-scoped latest page
 * (e.g. /c/aladdin/42/l/latest) instead of the global /latest.
 *
 * CategoriesAndLatestTopics imports CategoriesTopicList via a static
 * ES module import, bypassing the Ember container — so `modifyClass`
 * on the component has no effect. We use `onPageChange` with a short
 * polling loop to wait for the DOM element to appear after render.
 */
function initialize(api) {
  const siteSettings = api.container.lookup("service:site-settings");
  // Only apply this behavior if the setting is enabled.
  if (!siteSettings.projects_limit_latest_to_category) {
    return;
  }

  api.onPageChange(() => {
    const route = api.container.lookup("route:discovery.subcategories");
    const parentCategory = route?.controller?.model?.parentCategory;
    // No parent category means we're not on a subcategories page, so we can skip the rest of the logic.
    if (!parentCategory) {
      return;
    }

    const href = `/c/${parentCategory.slug}/${parentCategory.id}/l/latest`;
    const targetHref = getURL(href);

    // Poll for the .more-topics link to appear in the DOM (up to ~500ms).
    // This covers full page loads where Ember hasn't finished rendering yet.
    let attempts = 0;

    function retryRewrite() {
      if (attempts < 10) {
        attempts++;
        requestAnimationFrame(tryRewrite);
      }
    }

    function tryRewrite() {
      const moreLink = document.querySelector(".more-topics a");
      if (moreLink) {
        moreLink.href = targetHref;
        return;
      }

      retryRewrite();
    }

    tryRewrite();
  });
}

export default apiInitializer(initialize);
