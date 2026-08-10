import { withPluginApi } from "discourse/lib/plugin-api";
import Category from "discourse/models/category";

// A discovery.category slug path ends in "/edit" or "/edit/<tab>" when core's
// glob route swallowed what should have been the (never-registered, for
// non-staff) editCategory route. Stripping that suffix leaves a normal slug
// path for Category.findBySlugPathWithID to resolve.
const EDIT_SUFFIX = /\/edit(?:\/[^/]+)?\/?$/;

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
//
// Category.slugFor never emits a numeric id — only a category with a blank
// slug falls back to one — so every real "Edit category" entry point
// produces an id-less slug path (e.g. "faq/faq-child"). Resolve it the way
// core itself does, through Category.findBySlugPathWithID (which also
// happens to handle the id-bearing form, for direct/bookmarked URLs), rather
// than parsing an id out of the path.
export function editedCategoryId(transition) {
  const name = transition.to?.name;
  let slugPath;

  if (name?.startsWith("editCategory")) {
    // The admin route's dynamic segment (`slug`) lives on the `editCategory`
    // RouteInfo itself, never on its `.index`/`.tabs` children — RouteInfo
    // params only carry the segments owned by that specific route level.
    slugPath = transition.to.parent?.params?.slug;
  } else if (name === "discovery.category") {
    const path = transition.to.params?.category_slug_path_with_id;
    // core reserves only "none" as a category slug (Category::RESERVED_SLUGS
    // in app/models/category.rb), so a category can genuinely be slugged
    // "edit" — its own page (the full path resolving on its own) must be
    // left alone. Only a trailing /edit that doesn't belong to a real
    // category of that name is core's glob swallowing an edit URL.
    if (
      path &&
      EDIT_SUFFIX.test(path) &&
      !Category.findBySlugPathWithID(path)
    ) {
      slugPath = path.replace(EDIT_SUFFIX, "");
    }
  }

  if (!slugPath) {
    return null;
  }

  // Category.findBySlugPathWithID only searches the site's already-loaded
  // category list; an uncached category (possible with lazy_load_categories
  // on a direct URL visit) resolves to null here. That's fine: falling
  // through to core's normal handling of that URL is no worse than before
  // this initializer existed.
  return Category.findBySlugPathWithID(slugPath)?.id ?? null;
}

export default {
  name: "redirect-edit-category",
  initialize() {
    withPluginApi(initialize);
  },
};
