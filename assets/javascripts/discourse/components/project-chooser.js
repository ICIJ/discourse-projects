import { computed } from "@ember/object";
import { service } from "@ember/service";
import { classNames } from "@ember-decorators/component";
import CategoryChooserComponent from "select-kit/components/category-chooser";
import {
  pluginApiIdentifiers,
  selectKitOptions,
} from "select-kit/components/select-kit";
import Project from "../models/Project";
import ProjectDropdownSelectedName from "./project-dropdown/project-dropdown-selected-name";

@pluginApiIdentifiers(["project-chooser"])
@classNames("project-chooser")
@selectKitOptions({
  displayCategoryDescription: true,
  caretDownIcon: "caret-down",
  caretUpIcon: "caret-up",
  selectedNameComponent: ProjectDropdownSelectedName,
})
export default class ProjectChooser extends CategoryChooserComponent {
  @service project;

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
