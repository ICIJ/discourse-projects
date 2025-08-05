import { computed } from "@ember/object";
import { i18n } from "discourse-i18n";
import SelectedNameComponent from "select-kit/components/selected-name";

export default class ProjectDropdownSelectedName extends SelectedNameComponent {

  @computed("headerLabel", "title", "name")
  get label() {
    return this._safeProperty("label", this.item) ? super.label :  i18n("js.project_dropdown.label");
  }
}