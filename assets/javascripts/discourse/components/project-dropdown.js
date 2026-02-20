import { action, computed } from "@ember/object";
import { service } from "@ember/service";
import { classNames } from "@ember-decorators/component";
import DiscourseURL from "discourse/lib/url";
import { i18n } from "discourse-i18n";
import CategoryDrop from "select-kit/components/category-drop";
import {
  pluginApiIdentifiers,
  selectKitOptions,
} from "select-kit/components/select-kit";
import Project from "../models/Project";
import ProjectDropdownSelectedName from "./project-dropdown/project-dropdown-selected-name";

@pluginApiIdentifiers(["project-dropdown"])
@classNames("category-drop")
@selectKitOptions({
  clearable: true,
  selectedNameComponent: ProjectDropdownSelectedName,
  filterPlaceholder: "project_dropdown.placeholder",
})
export default class ProjectDropdown extends CategoryDrop {
  @service project;
  @service siteSettings;

  noCategoriesLabel = i18n("js.project_dropdown.select");

  @computed("project.all")
  get content() {
    return this.project.all;
  }

  async search(filter = "") {
    if (!filter) {
      return this.content;
    }
    return Project.asyncSearch(filter);
  }

  /**
   * When the user clears the dropdown and the setting `projects_home_logo_to_projects` is enabled,
   * we want to route them to the projects home page. Otherwise, we fallback to the default
   * behavior of clearing the category selection.
   */
  @action
  onChange(categoryId) {
    if (!categoryId && this.siteSettings.projects_home_logo_to_projects) {
      DiscourseURL.routeToUrl("/projects");
      return;
    }
    super.onChange(categoryId);
  }
}
