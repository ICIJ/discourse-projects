import { i18n } from "discourse-i18n";

const CategoryTitleField = <template>
  <@form.Field
    @name="name"
    @type="input"
    @title={{i18n "js.new_category.name.label"}}
    @validation="required"
  />
</template>;

export default CategoryTitleField;
