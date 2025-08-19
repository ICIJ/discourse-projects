import { computed } from "@ember/object";
import { service } from "@ember/service";
import { classNames } from "@ember-decorators/component";
import CategoryChooserComponent from "select-kit/components/category-chooser";
import {
  pluginApiIdentifiers,
  selectKitOptions,
} from "select-kit/components/select-kit";

@pluginApiIdentifiers(["project-chooser"])
@classNames("project-chooser")
@selectKitOptions({
  displayCategoryDescription: true,
  caretDownIcon: "caret-down",
  caretUpIcon: "caret-up",
})
export default class ProjectChooser extends CategoryChooserComponent {
  @service project;

  @computed("project.all")
  get content() {
    return this.project.all;
  }
}
