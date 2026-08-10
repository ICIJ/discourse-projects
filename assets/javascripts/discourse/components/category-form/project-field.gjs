import { hash } from "@ember/helper";
import { i18n } from "discourse-i18n";
import ProjectChooser from "../project-chooser";

// The chooser's selection is forwarded to @onChange, which the parent form
// uses to keep both the form field and the scoped parent chooser in sync. In
// edit mode the form passes @disabled (a category cannot be moved between
// projects from this form) and @required=false: the field is never submitted
// (updateCategory only sends name/color/logo ids), and a category that IS a
// project has no @project itself, so seeding a required field with null would
// make a locked, unfixable field block submit.
const CategoryProjectField = <template>
  <@form.Field
    @name="projectId"
    @type="custom"
    @title={{i18n "js.subcategory.project.label"}}
    @validation={{if @required "required"}}
    as |field|
  >
    <field.Control>
      <ProjectChooser
        @value={{field.value}}
        @onChange={{@onChange}}
        @options={{hash disabled=@disabled}}
      />
    </field.Control>
  </@form.Field>
</template>;

export default CategoryProjectField;
