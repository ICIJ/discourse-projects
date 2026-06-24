import { i18n } from "discourse-i18n";
import ProjectChooser from "../project-chooser";

// Required project. The chooser's selection is forwarded to @onChange, which the
// parent form uses to keep both the form field and the scoped parent chooser in
// sync.
const CategoryProjectField = <template>
  <@form.Field
    @name="projectId"
    @type="custom"
    @title={{i18n "js.subcategory.project.label"}}
    @validation="required"
    as |field|
  >
    <field.Control>
      <ProjectChooser @value={{field.value}} @onChange={{@onChange}} />
    </field.Control>
  </@form.Field>
</template>;

export default CategoryProjectField;
