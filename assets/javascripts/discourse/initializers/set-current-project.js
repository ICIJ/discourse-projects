import { withPluginApi } from "discourse/lib/plugin-api";
import Category from "discourse/models/category";

function isDefined(obj) {
  return obj !== null && typeof obj !== "undefined";
}

function isTopicOrCategory(path) {
  return path.startsWith("discovery.category") || path.startsWith("topic.");
}

function isRelatedToProjectCategory(category) {
  return category.read_restricted; // currently all read_restricted categories are considered realted a top category project
}

function initialize(api, container) {
  api.registerConnectorClass("above-main-container", "project-banner", {
    pluginId: "projects",

    setupComponent(args, component) {
      api.onPageChange(async (url, title) => {
        let currentProject = null
        const currentPath = container.lookup("router:main")?.currentPath
        //project banner should only appear on pages related to a project: categories or topics
        if (isTopicOrCategory(currentPath)) {
          // check if we are on a category page
          let category = container.lookup("controller:navigation/category")?.category;
          
          // if the category is not defined 
          // it means that we may be on a topic page
          if (!isDefined(category)) {
            const topic = container.lookup("controller:topic")?.get("model");
            if (isDefined(topic)) {
              const categoryId = topic.get("category_id");
              category = Category.findById(categoryId);
            }
          }
          
          // check the retrieved category is related to a project
          if (isDefined(category) && isRelatedToProjectCategory(category)) {
            // a category always have an ancestor (itself at least)
            // so the first ancestor is the top category
            currentProject = category.ancestors[0]; 
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
