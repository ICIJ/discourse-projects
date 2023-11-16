import { withPluginApi } from "discourse/lib/plugin-api";
import Category from "discourse/models/category";

function isDefined(obj){
  return obj !== null && typeof obj !== "undefined" 
}
function isTopicOrCategory(path){
  return path.startsWith("discovery.category") || path.startsWith("topic.")
}

function initialize(api,container) {

  api.registerConnectorClass("above-main-container", "project-banner", {
    pluginId: 'projects',
  
    setupComponent(args, component) {
      api.onPageChange(async (url, title) => {
        const nav = container.lookup('router:main')
        
        if (!isTopicOrCategory(nav.currentPath)) {
          component.set("topCategory", null);
          return;
        }
        
        let category = container.lookup('controller:navigation/category')?.category 
        if(!isDefined(category)){
          const topic = container.lookup('controller:topic')?.get("model"); 
          if(isDefined(topic)) {
            const categoryId = topic.get("category_id");
            category = Category.findById(categoryId);
          }
        } 

        if(isDefined(category)) {
          const topCategory = category.ancestors[0];
          component.set("topCategory", topCategory);
          return;
        }
        
        throw new Error("Missed the path",nav.currentPath)
      });
    },
  });
}

export default {
  name: "categories-header",
  initialize(container) {
    withPluginApi("1.8.0",  (api) => initialize(api, container));
  },
};