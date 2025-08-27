import { computed } from "@ember/object";
import { service } from "@ember/service";
import { classNames } from "@ember-decorators/component";
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
}
