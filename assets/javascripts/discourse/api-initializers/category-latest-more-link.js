import { apiInitializer } from "discourse/lib/api";
import getURL from "discourse/lib/get-url";

/**
 * When `projects_limit_latest_to_category` is enabled and we're viewing a
 * category's subcategories page, rewrite the "More" link at the bottom of
 * the latest topic list to point to the category-scoped latest page
 * (e.g. /c/aladdin/42/l/latest) instead of the global /latest.
 *
 * We use a MutationObserver because:
 * - CategoriesAndLatestTopics imports CategoriesTopicList via a static
 *   ES module import, bypassing the Ember container — so `modifyClass`
 *   on the component has no effect.
 * - `onPageChange` + `schedule("afterRender")` fires before the Ember
 *   app finishes rendering the component tree on full page loads.
 */
function initialize(api) {
  const siteSettings = api.container.lookup("service:site-settings");
  if (!siteSettings.projects_limit_latest_to_category) {
    return;
  }

  function rewriteMoreLink() {
    const route = api.container.lookup("route:discovery.subcategories");
    const parentCategory = route?.controller?.model?.parentCategory;
    if (!parentCategory) {
      return;
    }

    const moreLink = document.querySelector(".more-topics a");
    const href = `/c/${parentCategory.slug}/${parentCategory.id}/l/latest`;
    if (moreLink) {
      moreLink.href = getURL(href);
    }
  }

  // Observe the DOM for the .more-topics element appearing
  const observer = new MutationObserver(() => rewriteMoreLink());
  const childList = true;
  const subtree = true;
  observer.observe(document.documentElement, { childList, subtree });
  // Also run on page changes for Ember transitions where the DOM may
  // already be present but the link needs updating
  api.onPageChange(() => rewriteMoreLink());
}

export default apiInitializer(initialize);
