import { withPluginApi } from "discourse/lib/plugin-api";
import Category from "discourse/models/category";
import isBlank from "../helpers/is-blank";
import isDefined from "../helpers/is-defined";

/**
 * Recursively retrieves route parameters from the given route and its parent routes.
 *
 * This function collects route parameters from the specified route and merges them with
 * parameters from its parent routes, if any.
 *
 * @param {Object} route - The route from which to gather parameters.
 * @return {Object} - An aggregated object of parameters from the given route and its parents.
 */
function getRouteParams(route) {
  const parentParams = route.parent ? getRouteParams(route.parent) : {};
  return { ...parentParams, ...route.params };
}

/**
 * Retrieves the current route parameters from the router.
 *
 * This function looks up the current route in the router and utilizes `getRouteParams`
 * to extract and return the aggregated route parameters.
 *
 * @param {Object} container - The application's container instance.
 * @return {Object} - The aggregated route parameters of the current route.
 */
function getCurrentRouteParams(container) {
  const router = container.lookup("router:main");
  return getRouteParams(router.currentRoute);
}

/**
 * Gets the current category based on route parameters.
 *
 * This function looks up the current route parameters and attempts to find the category
 * either by ID, slug, or slug path with ID. If none is given, the function
 * will use the topic controller model.
 *
 * @param {Object} container - The application's container instance.
 * @returns {Category|null} - The found category or null if not found.
 */
function getCurrentCategory(container) {
  // Destructure for cleaner access
  const { category_id, category_slug, category_slug_path_with_id } =
    getCurrentRouteParams(container);

  if (isDefined(category_id)) {
    return Category.findById(category_id);
  }

  if (isDefined(category_slug)) {
    return Category.findSingleBySlug(category_slug);
  }

  if (isDefined(category_slug_path_with_id)) {
    return Category.findBySlugPathWithID(category_slug_path_with_id);
  }

  return container.lookup("controller:topic")?.get("model.category");
}

/**
 * Checks if the given container's route corresponds to a valid route.
 *
 * @param {Object} container - The application's container instance.
 * @return {boolean} - True if the route name starts with 'discovery.' or 'topic.', false otherwise.
 */
function isCurrentRouteValid(container) {
  const { currentRouteName: name } = container.lookup("router:main");
  return [
    "discovery.",
    "topic.",
    "subcategories",
    "newSubcategory",
    "members",
  ].some((pattern) => name.startsWith(pattern));
}

/**
 * Retrieves the current project based on the current route and category.
 *
 * This function checks if the current route is related to a project (categories or topics).
 * If so, it then determines whether the current category is a project or related to a project.
 *
 * @param {Object} container - The application's container instance.
 * @return {Object|null} - The current project or null if none is found.
 */
function getCurrentProject(container) {
  const category = getCurrentCategory(container);

  if (!isCurrentRouteValid(container)) {
    return null;
  }

  if (isBlank(category)) {
    return null;
  }

  if (category.is_project) {
    return category;
  }

  return category.project || null;
}

function initialize(api, container) {
  api.registerConnectorClass("above-main-container", "project-banner", {
    pluginId: "set-project-banner",

    setupComponent(_args, component) {
      api.onPageChange(async () => {
        const { siteSettings } = component.site;
        const currentProject = getCurrentProject(container);
        const showProjectBanner =
          siteSettings.projects_banner && currentProject;
        component.set("currentProject", currentProject);
        component.set("showProjectBanner", showProjectBanner);
      });
    },
  });
}

export default {
  name: "set-project-banner",
  initialize(container) {
    withPluginApi("1.8.0", (api) => initialize(api, container));
  },
};
