import Category from "discourse/models/category";
import ProjectChooserComponent from "./project-chooser";

const comp = ProjectChooserComponent.extend({
  pluginApiIdentifiers: ["search-advanced-project-chooser"],
  classNames: ["search-advanced-project-chooser"],

  selectKitOptions: {
    allowUncategorized: true,
    clearable: true,
    none: "search.advanced.in_project.all",
    displayCategoryDescription: true,
    permissionType: null,
  },
  actions: {
    onChange(id) {
      const project = Category.findById(id);
      const updateFn = "_updateSearchTermForProject";
      // This callback function is given by the search-advanced-options component
      // through a plugin-outlet argument of the same name.
      this.onChangeSearchedTermField("project", updateFn, project);
    },
  },
});

export default comp;
