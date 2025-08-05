import { action } from "@ember/object";
import { service } from "@ember/service";
import { classNames } from "@ember-decorators/component";
import { pluginApiIdentifiers, selectKitOptions } from "select-kit/components/select-kit";
import ProjectChooserComponent from "./project-chooser";

@pluginApiIdentifiers(["search-advanced-project-chooser"])
@classNames("search-advanced-project-chooser")
@selectKitOptions({
  allowUncategorized: true,
  clearable: true,
  none: "search.advanced.in_project.all",
  displayCategoryDescription: true,
  permissionType: null,
})
export default class SearchAdvancedProjectChooser extends ProjectChooserComponent {
  @service project;

  @action
  onChange(id) {
    const project = this.project.findById(id);
    const updateFn = "_updateSearchTermForProject";
    // This callback function is given by the search-advanced-options component
    // through a plugin-outlet argument of the same name.
    this.onChangeSearchedTermField("project", updateFn, project);
  }
}
