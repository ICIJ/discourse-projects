import { computed } from "@ember/object";
import { classNames } from "@ember-decorators/component";
import Category from "discourse/models/category";
import { i18n } from "discourse-i18n";
import CategoryDrop from "select-kit/components/category-drop";
import { pluginApiIdentifiers, selectKitOptions } from "select-kit/components/select-kit";
import ProjectDropdownSelectedName from "./project-dropdown/project-dropdown-selected-name";

@pluginApiIdentifiers(["project-dropdown"])
@classNames("category-drop")
@selectKitOptions({
  clearable: true,
  selectedNameComponent: ProjectDropdownSelectedName,
  filterPlaceholder: "project_dropdown.placeholder"
})
export default class ProjectDropdown extends CategoryDrop {
  noCategoriesLabel = i18n("js.project_dropdown.select");

  @computed
  get content() {
    return Category.list().filter((c) => c.is_project);
  }

  @computed("parentCategoryName", "selectKit.options.subCategory")
  get allCategoriesLabel() {
    return "toto"
  }
}

