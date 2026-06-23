import Component from "@glimmer/component";
import { tracked } from "@glimmer/tracking";
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
  @tracked permissions = {};

  formData;

  constructor() {
    super(...arguments);
    this.formData = {
      parentCategoryId: this.args.parentCategoryId ?? null,
      name: "",
      description: "",
      color: DEFAULT_COLOR,
      logo: null,
      logoDark: null,
    };
    if (this.args.parentCategoryId) {
      this.loadPermissions(this.args.parentCategoryId);
    }
  }

  @action
  async loadPermissions(categoryId) {
    this.permissions = categoryId
      ? await fetchCategoryPermissions(categoryId)
      : {};
  }

  @action
  async onProjectChange(categoryId) {
    await this.loadPermissions(categoryId);
  }

  @action
  async submit(data) {
    const category = await createCategory({
      name: data.name,
      parentCategoryId: data.parentCategoryId,
      description: data.description,
      color: data.color,
      uploadedLogoId: data.logo?.id,
      uploadedLogoDarkId: data.logoDark?.id,
      permissions: this.permissions,
    });

    if (this.args.onCreated) {
      this.args.onCreated(category);
    } else {
      DiscourseURL.routeTo(getURL(`/c/${category.slug}/${category.id}`));
    }
  }

  <template>
    <Form @data={{this.formData}} @onSubmit={{this.submit}} as |form|>
      <CategoryProjectField @form={{form}} @onChange={{this.onProjectChange}} />
      <CategoryTitleField @form={{form}} />
      <CategoryDescriptionField @form={{form}} />
      <CategoryColorField @form={{form}} />
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
      <form.Submit @label="new_category.submit" />
    </Form>
  </template>
}
