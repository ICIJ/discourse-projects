import Component from "@glimmer/component";
import { tracked } from "@glimmer/tracking";
import { fn } from "@ember/helper";
import { on } from "@ember/modifier";
import { action } from "@ember/object";
import { eq } from "truth-helpers";
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

  @tracked activeTab = "general";
  // Scopes the in-project parent chooser; kept in sync with the project field.
  @tracked selectedProjectId = this.args.parentCategoryId ?? null;
  // Drives which style value field (icon / emoji / none) is shown.
  @tracked selectedStyle = "square";

  // Seed values for FormKit's @data — read once at construction; FormKit owns
  // the live field state after that.
  formData = {
    projectId: this.args.parentCategoryId ?? null,
    parentCategoryId: null,
    name: "",
    description: "",
    color: DEFAULT_COLOR,
    styleType: "square",
    icon: null,
    emoji: null,
    logo: null,
    logoDark: null,
  };

  @action
  setTab(tab) {
    this.activeTab = tab;
  }

  @action
  onProjectChange(form, value) {
    this.selectedProjectId = value;
    // A scoped parent only makes sense within the chosen project, so clear it
    // whenever the project changes.
    form.set("parentCategoryId", null);
  }

  @action
  onStyleChange(value) {
    this.selectedStyle = value;
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
      // Only the value matching the chosen style is meaningful.
      styleType: data.styleType,
      icon: data.styleType === "icon" ? data.icon : null,
      emoji: data.styleType === "emoji" ? data.emoji : null,
    });

    if (this.args.onCreated) {
      this.args.onCreated(category);
    } else {
      DiscourseURL.routeTo(getURL(`/c/${category.slug}/${category.id}`));
    }
  }

  <template>
    <Form @data={{this.formData}} @onSubmit={{this.submit}} as |form|>
      <div class="category-form__tabs">
        <button
          type="button"
          class="category-form__tab
            {{if (eq this.activeTab 'general') 'is-active'}}"
          {{on "click" (fn this.setTab "general")}}
        >
          {{i18n "js.new_category.tab.general"}}
        </button>
        <button
          type="button"
          class="category-form__tab
            {{if (eq this.activeTab 'appearance') 'is-active'}}"
          {{on "click" (fn this.setTab "appearance")}}
        >
          {{i18n "js.new_category.tab.appearance"}}
        </button>
      </div>

      <div
        class="category-form__panel
          {{if (eq this.activeTab 'general') 'is-active'}}"
      >
        <CategoryTitleField @form={{form}} />
        <CategoryDescriptionField @form={{form}} />
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
      </div>

      <div
        class="category-form__panel
          {{if (eq this.activeTab 'appearance') 'is-active'}}"
      >
        <CategoryColorField @form={{form}} />

        <form.Field
          @name="styleType"
          @type="radio-group"
          @title={{i18n "js.new_category.style.label"}}
          @onSet={{this.onStyleChange}}
          as |field|
        >
          <field.Control as |group|>
            <group.Radio @value="icon">
              {{i18n "js.new_category.style.icon"}}
            </group.Radio>
            <group.Radio @value="emoji">
              {{i18n "js.new_category.style.emoji"}}
            </group.Radio>
            <group.Radio @value="square">
              {{i18n "js.new_category.style.square"}}
            </group.Radio>
          </field.Control>
        </form.Field>

        {{#if (eq this.selectedStyle "icon")}}
          <form.Field
            @name="icon"
            @type="icon"
            @title={{i18n "js.new_category.icon.label"}}
            as |field|
          >
            <field.Control />
          </form.Field>
        {{/if}}

        {{#if (eq this.selectedStyle "emoji")}}
          <form.Field
            @name="emoji"
            @type="emoji"
            @title={{i18n "js.new_category.emoji.label"}}
            as |field|
          >
            <field.Control />
          </form.Field>
        {{/if}}

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
      </div>

      <div class="category-form__actions">
        <form.Submit @label="new_category.submit" />
      </div>
    </Form>
  </template>
}
