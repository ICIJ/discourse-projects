import { withPluginApi } from "discourse/lib/plugin-api";

/**
 * Redirects the core admin newCategory.* routes to the plugin form at
 * /categories/new when projects_custom_category_form is enabled.
 * route:new-category lives in the lazily-loaded admin bundle, so modifyClass
 * cannot touch it (it no-ops at boot); intercepting the transition from the
 * main bundle is the reliable mechanism.
 */
function initialize(api) {
  const router = api.container.lookup("service:router");
  const siteSettings = api.container.lookup("service:site-settings");
  const projectService = api.container.lookup("service:project");

  router.on("routeWillChange", (transition) => {
    if (!siteSettings.projects_custom_category_form) {
      return;
    }
    // Catches newCategory, newCategory.index, .setup, .tabs. Our own route
    // (projectsNewCategory) does NOT match, so there is no redirect loop.
    if (transition.to?.name?.startsWith("newCategory")) {
      transition.abort();
      router.replaceWith("projectsNewCategory", {
        queryParams: categoryContextQueryParams(projectService),
      });
    }
  });
}

// Forward the category the user was viewing so the form preselects it:
//   - a project        -> preselect that project;
//   - a category inside a project -> preselect the project AND that category
//     as the in-project parent.
// Both keys are always set (nulled when unused) so a previous selection can't
// linger via Ember's sticky query params.
function categoryContextQueryParams(projectService) {
  const category = projectService?.category;

  if (category?.is_project) {
    return { projectId: category.id, parentCategoryId: null };
  }

  if (category?.project?.id) {
    return { projectId: category.project.id, parentCategoryId: category.id };
  }

  return { projectId: null, parentCategoryId: null };
}

export default {
  name: "redirect-new-category",
  initialize() {
    withPluginApi(initialize);
  },
};
