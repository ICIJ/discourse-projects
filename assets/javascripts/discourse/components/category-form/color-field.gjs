import { i18n } from "discourse-i18n";

const CategoryColorField = <template>
  <@form.Field
    @name="color"
    @type="color"
    @title={{i18n "js.new_category.color.label"}}
  />
</template>;

export default CategoryColorField;
