import { withPluginApi } from "discourse/lib/plugin-api";
import Category from "discourse/models/category";

function isDefined(obj) {
  return obj !== null && typeof obj !== "undefined";
}

function isTopicOrCategory(path) {
  return path.startsWith("discovery.category") || path.startsWith("topic.");
}

function initialize(api, container) {
  api.registerConnectorClass("above-main-container", "project-banner", {
    pluginId: "set-current-project",

    setupComponent(args, component) {
      api.onPageChange(async () => {
        let currentProject = null;
        const currentPath = container.lookup("router:main")?.currentPath;
        // Project banner should only appear on pages related to a project: categories or topics
        if (isTopicOrCategory(currentPath)) {
          // Check if we are on a category page
          let category = container.lookup(
            "controller:navigation/category"
          )?.category;

          // If the category is not defined
          // it means that we may be on a topic page
          if (!isDefined(category)) {
            const topic = container.lookup("controller:topic")?.get("model");

            if (isDefined(topic)) {
              const categoryId = topic.get("category_id");
              category = Category.findById(categoryId);
            }
          }

          if (isDefined(category)) {
            // Check if the category itself is a project
            if (category.is_project) {
              currentProject = category;
              // Check the retrieved category is related to a project
            } else if (isDefined(category.project)) {
              currentProject = category.project;
            }
          }
        }
        component.set("currentProject", currentProject);
      });
    },
  });
}

export default {
  name: "categories-header",
  initialize(container) {
    withPluginApi("1.8.0", (api) => initialize(api, container));
  },
};
