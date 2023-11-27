import { withPluginApi } from "discourse/lib/plugin-api";
import Category from "discourse/models/category";
import isDefined from "../helpers/is-defined";
import isUndefined from "../helpers/is-undefined";

function isTopicOrCategory(routeName) {
  return ["discovery.", "topic."].some(pattern => routeName.startsWith(pattern));
}

function getCurrentCategory(container) {
  // Check if we are on a category page
  const category = container.lookup("controller:navigation/category")?.category;
  if (isDefined(category)) {
    return category;
  }
  // If the category is not defined it means that we may be on a topic page
  const topic = container.lookup("controller:topic")?.get("model");
  if (isDefined(topic)) {
    const categoryId = topic.get("category_id");
    return Category.findById(categoryId);
  }
}

function getCurrentProject(container) {
  const router = container.lookup("router:main");
  
  // Project banner should only appear on pages related to a project: categories or topics
  if (!isTopicOrCategory(router?.currentRouteName)) {
    return;
  }

  const category = getCurrentCategory(container);

  if (isUndefined(category)) {
    return;
  }

  // Check if the category itself is a project
  if (category.is_project) {
    return category;
  }

  // Check the retrieved category is related to a project
  if (isDefined(category.project)) {
    return category.project;
  }
}

function initialize(api, container) {

  api.registerConnectorClass("above-main-container", "project-banner", {
    pluginId: "set-project-banner",

    setupComponent(args, component) {
      api.onPageChange(async () => {
        const currentProject = getCurrentProject(container);
        const { siteSettings } = component.site;
        component.set("currentProject", currentProject);
        component.set("showProjectBanner", siteSettings.projects_banner && currentProject);
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
