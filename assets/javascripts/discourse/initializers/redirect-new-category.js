import { withPluginApi } from "discourse/lib/plugin-api";
import categoryContextQueryParams from "../lib/category-context-query-params";

/**
 * Redirects the core admin newCategory.* routes to the plugin form at
 * /categories/new when projects_custom_category_form is enabled.
 * route:new-category lives in the lazily-loaded admin bundle, so modifyClass
 * cannot touch it (it no-ops at boot). Two mechanisms cover it: intercepting
 * the transition (staff, who have the admin routes registered) and overriding
 * the categoryTypeChooser service the core buttons call (everyone else, for
 * whom the route doesn't exist at all).
 */
function initialize(api) {
  const router = api.container.lookup("service:router");
  const siteSettings = api.container.lookup("service:site-settings");
  const projectService = api.container.lookup("service:project");

  const formTarget = () => [
    "projectsNewCategory",
    { queryParams: categoryContextQueryParams(projectService?.category) },
  ];

  router.on("routeWillChange", (transition) => {
    if (!siteSettings.projects_custom_category_form) {
      return;
    }
    // Catches newCategory, newCategory.index, .setup, .tabs. Our own route
    // (projectsNewCategory) does NOT match, so there is no redirect loop.
    if (transition.to?.name?.startsWith("newCategory")) {
      transition.abort();
      // replaceWith so the aborted /new-category doesn't linger in history.
      router.replaceWith(...formTarget());
    }
  });

  // Both core "New category" buttons (discovery navigation and the sidebar
  // categories section) go through this service. For non-staff the admin
  // bundle is never loaded, so `newCategory.setup` isn't even registered and
  // transitionTo asserts before routeWillChange can fire: redirect at the
  // shared choke point instead of relying on the transition.
  api.modifyClass(
    "service:category-type-chooser",
    (Superclass) =>
      class extends Superclass {
        createCategory() {
          if (!siteSettings.projects_custom_category_form) {
            return super.createCategory(...arguments);
          }
          // transitionTo, like core: the page the button was clicked from
          // stays in history.
          router.transitionTo(...formTarget());
        }
      }
  );
}

export default {
  name: "redirect-new-category",
  initialize() {
    withPluginApi(initialize);
  },
};
