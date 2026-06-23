import Component from "@glimmer/component";
import { tracked } from "@glimmer/tracking";
import { fn } from "@ember/helper";
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
import CategoryParentField from "./category-form/parent-field";
import CategoryProjectField from "./category-form/project-field";
import CategoryTitleField from "./category-form/title-field";

// Matches core's default new-category background colour; the field is always
// pre-filled so a colour is always sent.
const DEFAULT_COLOR = "0088CC";

export default class CategoryForm extends Component {
  // @parentCategoryId (a pre-selected project), @onCreated(category)

  // Scopes the in-project parent chooser; kept in sync with the project field.
  @tracked selectedProjectId = this.args.parentCategoryId ?? null;

  // Seed values for FormKit's @data — read once at construction; FormKit owns
  // the live field state after that.
  formData = {
    projectId: this.args.parentCategoryId ?? null,
    parentCategoryId: null,
    name: "",
    description: "",
    color: DEFAULT_COLOR,
    logo: null,
    logoDark: null,
  };

  @action
  onProjectChange(form, value) {
    this.selectedProjectId = value;
    // A scoped parent only makes sense within the chosen project, so clear it
    // whenever the project changes.
    form.set("parentCategoryId", null);
  }

  @action
  async submit(data) {
    // The optional in-project parent, when set, is the actual parent; otherwise
    // the category sits directly under the project. Permissions inherit from
    // that effective parent so a subcategory of a private project stays private.
    const parentCategoryId = data.parentCategoryId ?? data.projectId;
    const permissions = parentCategoryId
      ? await fetchCategoryPermissions(parentCategoryId)
      : {};

    const category = await createCategory({
      name: data.name,
      parentCategoryId,
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
      <section class="category-form__section">
        <h2 class="category-form__section-title">
          {{i18n "js.new_category.section.details"}}
        </h2>
        <CategoryTitleField @form={{form}} />
        <CategoryDescriptionField @form={{form}} />
      </section>

      <section class="category-form__section">
        <div class="category-form__location">
          <CategoryProjectField
            @form={{form}}
            @onChange={{fn this.onProjectChange form}}
          />
          <CategoryParentField
            @form={{form}}
            @projectId={{this.selectedProjectId}}
          />
        </div>
      </section>

      <section class="category-form__section">
        <h2 class="category-form__section-title">
          {{i18n "js.new_category.section.appearance"}}
        </h2>
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
      </section>

      <div class="category-form__actions">
        <form.Submit @label="new_category.submit" />
      </div>
    </Form>
  </template>
}
