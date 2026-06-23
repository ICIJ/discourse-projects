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

  router.on("routeWillChange", (transition) => {
    if (!siteSettings.projects_custom_category_form) {
      return;
    }
    // Catches newCategory, newCategory.index, .setup, .tabs. Our own route
    // (projectsNewCategory) does NOT match, so there is no redirect loop.
    if (transition.to?.name?.startsWith("newCategory")) {
      transition.abort();
      router.replaceWith("projectsNewCategory");
    }
  });
}

export default {
  name: "redirect-new-category",
  initialize() {
    withPluginApi(initialize);
  },
};
