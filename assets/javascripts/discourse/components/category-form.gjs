import Component from "@glimmer/component";
import { action } from "@ember/object";
import Form from "discourse/components/form";
import getURL from "discourse/lib/get-url";
import DiscourseURL from "discourse/lib/url";
import { i18n } from "discourse-i18n";
import createCategory from "../lib/create-category";
import fetchCategoryPermissions from "../lib/fetch-category-permissions";
import CategoryColorField from "./category-form/color-field";
import CategoryDescriptionField from "./category-form/description-field";
import CategoryLogoField from "./category-form/logo-field";
import CategoryProjectField from "./category-form/project-field";
import CategoryTitleField from "./category-form/title-field";

// Matches core's default new-category background colour; the field is always
// pre-filled so a colour is always sent.
const DEFAULT_COLOR = "0088CC";

export default class CategoryForm extends Component {
  // @parentCategoryId, @onCreated(category)

  // Seed values for FormKit's @data — read once at construction; FormKit owns
  // the live field state after that.
  formData = {
    parentCategoryId: this.args.parentCategoryId ?? null,
    name: "",
    description: "",
    color: DEFAULT_COLOR,
    logo: null,
    logoDark: null,
  };

  @action
  async submit(data) {
    // Fetch permissions at submit time so the result is always keyed to the
    // actually-submitted parent — no async race between eager load and submit.
    const permissions = data.parentCategoryId
      ? await fetchCategoryPermissions(data.parentCategoryId)
      : {};

    const category = await createCategory({
      name: data.name,
      parentCategoryId: data.parentCategoryId,
      description: data.description,
      color: data.color,
      uploadedLogoId: data.logo?.id,
      uploadedLogoDarkId: data.logoDark?.id,
      permissions,
    });

    if (this.args.onCreated) {
      this.args.onCreated(category);
    } else {
      DiscourseURL.routeTo(getURL(`/c/${category.slug}/${category.id}`));
    }
  }

  <template>
    <Form @data={{this.formData}} @onSubmit={{this.submit}} as |form|>
      <CategoryProjectField @form={{form}} />
      <CategoryTitleField @form={{form}} />
      <CategoryDescriptionField @form={{form}} />
      <CategoryColorField @form={{form}} />
      <div class="category-form__logos">
        <CategoryLogoField
          @form={{form}}
          @name="logo"
          @title={{i18n "js.new_category.logo.label"}}
          @uploadType="logo"
        />
        <CategoryLogoField
          @form={{form}}
          @name="logoDark"
          @title={{i18n "js.new_category.logo_dark.label"}}
          @uploadType="logo"
        />
      </div>
      <form.Submit @label="new_category.submit" />
    </Form>
  </template>
}
