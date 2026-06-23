import { i18n } from "discourse-i18n";

const CategoryDescriptionField = <template>
  <@form.Field
    @name="description"
    @type="textarea"
    @title={{i18n "js.new_category.description.label"}}
    as |field|
  >
    <field.Control />
  </@form.Field>
</template>;

export default CategoryDescriptionField;
