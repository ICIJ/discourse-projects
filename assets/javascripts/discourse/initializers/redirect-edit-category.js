import { withPluginApi } from "discourse/lib/plugin-api";

// Matches a category slug path whose last segment is `edit`, optionally
// followed by a tab: "faq/faq-child/500/edit" or ".../500/edit/general". The
// capture is the category id, which always precedes `edit` because a real slug
// path ends in the numeric id.
const EDIT_SLUG_PATH = /(?:^|\/)(\d+)\/edit(?:\/[^/]+)?\/?$/;

/**
 * Sends non-staff users from core's category edit route to the plugin form at
 * /categories/:id/edit when projects_custom_category_form is enabled. Staff are
 * left alone: core's admin form has tabs this one deliberately omits.
 *
 * Two branches, because the target route depends on whether the admin bundle is
 * loaded. When it is (staff sessions, and always in the test environment), the
 * transition resolves to the admin `editCategory` route. When it is not — a
 * real non-staff session — that route was never registered, so core's
 * `/c/*category_slug_path_with_id` glob swallows the URL and the transition
 * resolves to `discovery.category` instead.
 */
function initialize(api) {
  const router = api.container.lookup("service:router");
  const siteSettings = api.container.lookup("service:site-settings");
  const currentUser = api.container.lookup("service:current-user");

  router.on("routeWillChange", (transition) => {
    if (!siteSettings.projects_custom_category_form) {
      return;
    }
    if (!currentUser || currentUser.staff) {
      return;
    }

    const categoryId = editedCategoryId(transition);
    if (!categoryId) {
      return;
    }

    transition.abort();
    // replaceWith so the aborted /c/.../edit doesn't linger in history.
    router.replaceWith("projectsEditCategory", categoryId);
  });
}

// The id of the category the transition is trying to edit, or null.
function editedCategoryId(transition) {
  const name = transition.to?.name;

  if (name?.startsWith("editCategory")) {
    // The admin route's dynamic segment (`slug`) lives on the `editCategory`
    // RouteInfo itself, never on its `.index`/`.tabs` children — RouteInfo
    // params only carry the segments owned by that specific route level.
    const slug = transition.to.parent?.params?.slug;
    return slug?.match(/(?:^|\/)(\d+)\/?$/)?.[1] ?? null;
  }

  if (name === "discovery.category") {
    const path = transition.to.params?.category_slug_path_with_id;
    return path?.match(EDIT_SLUG_PATH)?.[1] ?? null;
  }

  return null;
}

export default {
  name: "redirect-edit-category",
  initialize() {
    withPluginApi(initialize);
  },
};
