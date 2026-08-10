import Component from "@glimmer/component";
import { tracked } from "@glimmer/tracking";
import { fn } from "@ember/helper";
import { on } from "@ember/modifier";
import { action } from "@ember/object";
import { eq, not } from "truth-helpers";
import Form from "discourse/components/form";
import getURL from "discourse/lib/get-url";
import DiscourseURL from "discourse/lib/url";
import Category from "discourse/models/category";
import { i18n } from "discourse-i18n";
import createCategory from "../lib/create-category";
import fetchCategoryPermissions from "../lib/fetch-category-permissions";
import updateCategory from "../lib/update-category";
import CategoryColorField from "./category-form/color-field";
import CategoryDescriptionDisplay from "./category-form/description-display";
import CategoryDescriptionField from "./category-form/description-field";
import CategoryFormFooter from "./category-form/footer";
import CategoryLogoField from "./category-form/logo-field";
import CategoryParentField from "./category-form/parent-field";
import CategoryProjectField from "./category-form/project-field";
import CategoryTitleField from "./category-form/title-field";

// Matches core's default new-category background colour; the field is always
// pre-filled so a colour is always sent.
const DEFAULT_COLOR = "0088CC";

export default class CategoryForm extends Component {
  // @projectId (a pre-selected project), @parentCategoryId (a pre-selected
  // in-project parent), @onCreated(category), @category (edit mode)

  @tracked activeTab = "general";
  // Scopes the in-project parent chooser; kept in sync with the project field.
  @tracked selectedProjectId = this.seededProjectId;

  // Seed values for FormKit's @data — read once at construction; FormKit owns
  // the live field state after that.
  formData = this.isEditing
    ? {
        projectId: this.seededProjectId,
        parentCategoryId: this.seededParentCategoryId,
        name: this.args.category.name,
        color: this.args.category.color,
        logo: this.args.category.uploaded_logo,
        logoDark: this.args.category.uploaded_logo_dark,
      }
    : {
        projectId: this.seededProjectId,
        parentCategoryId: this.seededParentCategoryId,
        name: "",
        description: "",
        color: DEFAULT_COLOR,
        logo: null,
        logoDark: null,
      };

  // Edit mode reuses the same fields, minus the ones a creator must not change:
  // project and parent are locked, and the description is read-only because it
  // lives in the definition topic as markdown we do not have here.
  get isEditing() {
    return !!this.args.category;
  }

  // Only honour a preselected project if it actually resolves to a project; a
  // non-project id would leave the (project-only) chooser blank. When the id
  // isn't loaded yet we keep it — we only drop seeds we can prove are wrong.
  get seededProjectId() {
    if (this.isEditing) {
      return this.args.category.project?.id ?? null;
    }

    const projectId = this.args.projectId ?? null;
    if (!projectId) {
      return null;
    }
    const category = Category.findById(projectId);
    return category && !category.is_project ? null : projectId;
  }

  // Only honour a preselected in-project parent if it belongs to the chosen
  // project; otherwise the descendant-scoped parent chooser can't resolve it
  // (e.g. ?projectId=A&parentCategoryId=B where B lives outside A).
  get seededParentCategoryId() {
    if (this.isEditing) {
      // A category sitting directly under its project has the project as its
      // parent; the create form models that as "no in-project parent", so mirror
      // it rather than showing the project twice.
      const parentId = this.args.category.parent_category_id ?? null;
      return parentId === this.seededProjectId ? null : parentId;
    }

    const projectId = this.seededProjectId;
    const parentId = this.args.parentCategoryId ?? null;
    if (!projectId || !parentId) {
      return null;
    }
    // Only drop a seed we can prove belongs to a different project. An
    // unresolved project ancestor (parent not loaded, or its `.project` not
    // populated) is not proof of mismatch, so we keep the seed — mirroring
    // seededProjectId, which also only drops seeds it can prove are wrong.
    const parentProjectId = Category.findById(parentId)?.project?.id;
    return parentProjectId && parentProjectId !== projectId ? null : parentId;
  }

  // Cancel returns the user to the context the form was opened from: the
  // in-project parent when there is one, else the project, else the projects
  // index. Reuses the seeded getters so a parent that provably belongs to a
  // different project falls back to the project rather than being trusted.
  get cancelUrl() {
    if (this.isEditing) {
      return this.args.category.url;
    }

    const id = this.seededParentCategoryId ?? this.seededProjectId;
    return Category.findById(id)?.url ?? getURL("/projects");
  }

  @action
  setTab(tab) {
    this.activeTab = tab;
  }

  @action
  onProjectChange(form, value) {
    form.set("projectId", value);
    this.selectedProjectId = value;
    // A scoped parent only makes sense within the chosen project, so clear it
    // whenever the project changes.
    form.set("parentCategoryId", null);
  }

  @action
  cancel() {
    // A plain transition. FormKit's own routeWillChange guard puts up the
    // "you didn't submit your changes" confirm when the form is dirty, so
    // there is nothing to confirm here.
    DiscourseURL.routeTo(this.cancelUrl);
  }

  @action
  async submit(data) {
    if (this.isEditing) {
      await updateCategory(this.args.category.id, {
        name: data.name,
        color: data.color,
        uploadedLogoId: data.logo?.id,
        uploadedLogoDarkId: data.logoDark?.id,
      });
      DiscourseURL.routeTo(this.args.category.url);
      return;
    }

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
        {{#if this.isEditing}}
          <CategoryDescriptionDisplay @form={{form}} @category={{@category}} />
        {{else}}
          <CategoryDescriptionField @form={{form}} />
        {{/if}}
        <div class="category-form__location">
          <CategoryProjectField
            @form={{form}}
            @onChange={{fn this.onProjectChange form}}
            @disabled={{this.isEditing}}
            @required={{not this.isEditing}}
          />
          <CategoryParentField
            @form={{form}}
            @projectId={{this.selectedProjectId}}
            @disabled={{this.isEditing}}
          />
        </div>
      </div>

      <div
        class="category-form__panel
          {{if (eq this.activeTab 'appearance') 'is-active'}}"
      >
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
      </div>

      <CategoryFormFooter
        @form={{form}}
        @category={{@category}}
        @onCancel={{this.cancel}}
      />
    </Form>
  </template>
}
