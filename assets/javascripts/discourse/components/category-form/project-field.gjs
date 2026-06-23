import Component from "@glimmer/component";
import { fn } from "@ember/helper";
import { action } from "@ember/object";
import { i18n } from "discourse-i18n";
import ProjectChooser from "../project-chooser";

export default class CategoryProjectField extends Component {
  // @form, @onChange(value)
  @action
  change(field, value) {
    field.set(value);
    this.args.onChange?.(value);
  }

  <template>
    <@form.Field
      @name="parentCategoryId"
      @type="custom"
      @title={{i18n "js.subcategory.project.label"}}
      @validation="required"
      as |field|
    >
      <field.Control>
        <ProjectChooser
          @value={{field.value}}
          @onChange={{fn this.change field}}
        />
      </field.Control>
    </@form.Field>
  </template>
}
