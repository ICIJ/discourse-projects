import Component from "@glimmer/component";
import { tracked } from "@glimmer/tracking";
import { hash } from "@ember/helper";
import { action } from "@ember/object";
import { service } from "@ember/service";
import { not } from "truth-helpers";
import { ajax } from "discourse/lib/ajax";
import { popupAjaxError } from "discourse/lib/ajax-error";
import Category from "discourse/models/category";
import Site from "discourse/models/site";
import { i18n } from "discourse-i18n";
import ProjectChooser from "./project-chooser";
import SubcategoryChooser from "./subcategory-chooser";

/**
 * Registered "Project" tab for the category form.
 *
 * Two linked selectors kept in sync with the rest of the new-category flow via
 * the form's single source of truth, `parent_category_id`:
 *
 *  - Project (REQUIRED): drives the category's permissions. Selecting a project
 *    inherits its group permissions onto the form (mirroring core's
 *    onParentCategoryChange and the plugin's new-category-parent route inject)
 *    and resets the parent selector to "directly under the project".
 *  - Parent (OPTIONAL): scoped to the selected project's descendants; it only
 *    affects nesting (`parent_category_id`), never permissions.
 *
 * `parent_category_id = chosenParent?.id ?? selectedProjectId`.
 */
export default class ProjectTab extends Component {
  @service project;

  @tracked selectedProjectId = null;
  @tracked parentValue = null;

  constructor() {
    super(...arguments);
    this.deriveFromCategory();
    this.args.registerValidator?.(this.validateProject.bind(this));
  }

  /**
   * Surfaces the "project required" error on the project chooser itself (the
   * existing new-category-permissions.js validator enforces the same rule via
   * `parent_category_id`, but that field is hidden — this puts the message where
   * the user is choosing). Creation-only: editing an existing category (incl. a
   * top-level project, which has no parent) must not be blocked.
   */
  validateProject(data, helpers) {
    if (this.args.category?.id) {
      return;
    }
    if (this.selectedProjectId) {
      return;
    }
    helpers?.addError?.("project_category_id", {
      title: i18n("subcategory.project.label"),
      message: i18n("subcategory.errors.parent"),
    });
  }

  get projects() {
    return this.project.all;
  }

  /**
   * Derive the initial project + parent from the existing parent chain. The
   * form's `parent_category_id` (transientData, falling back to the model) is
   * the single source of truth shared with the entry modal and route inject.
   *  - The project is the parent category itself when it is a project, else its
   *    `.project` (both exposed by the serializer).
   *  - The parent selector pre-fills only when the parent is NOT the project
   *    itself (i.e. the category nests under a descendant of the project).
   */
  deriveFromCategory() {
    const parentId =
      this.args.transientData?.parent_category_id ??
      this.args.category?.parent_category_id;

    if (!parentId) {
      return;
    }

    const parent = Category.findById(parentId);
    if (!parent) {
      // Project list is loaded in the service; fall back to treating the raw
      // parent id as the project so the form stays consistent.
      this.selectedProjectId = parentId;
      return;
    }

    const project = parent.is_project ? parent : parent.project;
    this.selectedProjectId = project?.id ?? parentId;

    if (parentId !== this.selectedProjectId) {
      this.parentValue = parentId;
    }
  }

  @action
  async onProjectChange(projectId) {
    this.selectedProjectId = projectId;
    // Reset nesting to directly-under-project and clear the parent selector.
    this.parentValue = null;
    this.args.form.set("parent_category_id", projectId);

    if (!projectId) {
      return;
    }

    // Inherit the project's group permissions onto the form. Mirrors the logic
    // in initializers/new-category-parent.js so the tab and the route inject
    // stay consistent.
    try {
      const { category } = await ajax(`/c/${projectId}/show.json`);
      const parentCategory = Site.current().updateCategory(category);
      parentCategory?.setupGroupsAndPermissions?.();
      const parentPermissions = parentCategory?.permissions ?? [];
      this.args.form.set(
        "permissions",
        parentPermissions.map((p) => ({
          group_name: p.group_name,
          group_id: p.group_id,
          permission_type: p.permission_type,
        }))
      );
    } catch (error) {
      popupAjaxError(error);
    }
  }

  @action
  onParentChange(parentId) {
    this.parentValue = parentId;
    // No parent chosen → the category sits directly under the project.
    // Parent selection never touches permissions.
    this.args.form.set(
      "parent_category_id",
      parentId || this.selectedProjectId
    );
  }

  <template>
    <div class="project-tab edit-category-tab-project">
      <@form.Field
        @name="project_category_id"
        @title={{i18n "subcategory.project.label"}}
        @format="large"
        @type="custom"
        as |field|
      >
        <field.Control>
          <ProjectChooser
            @value={{this.selectedProjectId}}
            @onChange={{this.onProjectChange}}
            @options={{hash none="subcategory.project.placeholder"}}
          />
        </field.Control>
      </@form.Field>

      <@form.Field
        @name="scoped_parent_category_id"
        @title={{i18n "subcategory.parent.label"}}
        @format="large"
        @type="custom"
        as |field|
      >
        <field.Control>
          <SubcategoryChooser
            @parentCategoryId={{this.selectedProjectId}}
            @value={{this.parentValue}}
            @onChange={{this.onParentChange}}
            @options={{hash
              none="subcategory.parent.placeholder"
              disabled=(not this.selectedProjectId)
            }}
          />
        </field.Control>
      </@form.Field>
    </div>
  </template>
}
