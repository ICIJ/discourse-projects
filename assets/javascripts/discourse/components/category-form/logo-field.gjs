import { fn } from "@ember/helper";
import UppyImageUploader from "discourse/components/uppy-image-uploader";

const CategoryLogoField = <template>
  <@form.Field @name={{@name}} @type="custom" @title={{@title}} as |field|>
    <field.Control>
      <UppyImageUploader
        @id={{@name}}
        @imageUrl={{field.value.url}}
        @type={{@uploadType}}
        @onUploadDone={{field.set}}
        @onUploadDeleted={{fn field.set undefined}}
        class="category-logo-uploader no-repeat contain-image"
      />
    </field.Control>
  </@form.Field>
</template>;

export default CategoryLogoField;
