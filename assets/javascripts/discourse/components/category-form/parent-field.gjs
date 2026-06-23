import { hash } from "@ember/helper";
import { not } from "truth-helpers";
import { i18n } from "discourse-i18n";
import SubcategoryChooser from "../subcategory-chooser";

// Optional in-project parent. The chooser is scoped to the selected project's
// descendants (@projectId) and disabled until a project is picked; leaving it
// empty places the new category directly under the project.
const CategoryParentField = <template>
  <@form.Field
    @name="parentCategoryId"
    @type="custom"
    @title={{i18n "js.subcategory.parent.label"}}
    as |field|
  >
    <field.Control>
      <SubcategoryChooser
        @parentCategoryId={{@projectId}}
        @value={{field.value}}
        @onChange={{field.set}}
        @options={{hash
          none="js.subcategory.parent.placeholder"
          clearable=true
          disabled=(not @projectId)
        }}
      />
    </field.Control>
  </@form.Field>
</template>;

export default CategoryParentField;
