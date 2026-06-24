import Component from "@glimmer/component";
import { on } from "@ember/modifier";
import { action } from "@ember/object";
import { service } from "@ember/service";
import icon from "discourse/helpers/d-icon";
import { i18n } from "discourse-i18n";

export default class NewSubcategoryButton extends Component {
  @service siteSettings;
  @service router;

  @action
  click() {
    this.router.transitionTo("projectsNewCategory", {
      queryParams: this.queryParams,
    });
  }

  // Pre-fills the form from where the button was clicked:
  //   - from a project: preselect that project;
  //   - from a category inside a project: preselect the project AND that
  //     category as the in-project parent;
  //   - from anywhere else (e.g. the homepage): no preselection.
  // Both params are always specified (nulled when unused) so a previous
  // selection never leaks in through Ember's sticky query params.
  get queryParams() {
    const category = this.currentCategory;

    if (category?.is_project) {
      return { projectId: category.id, parentCategoryId: null };
    }

    if (category) {
      return {
        projectId: category.project?.id ?? null,
        parentCategoryId: category.id,
      };
    }

    return { projectId: null, parentCategoryId: null };
  }

  get currentCategory() {
    return this.args.category ?? null;
  }

  get currentCategoryLevel() {
    return this.currentCategory?.level;
  }

  get label() {
    return i18n("js.subcategory.button.label");
  }

  get canCreateSubcategory() {
    return (
      !this.currentCategory ||
      this.maxCategoryNesting > this.currentCategoryLevel + 1
    );
  }

  get maxCategoryNesting() {
    return this.siteSettings.max_category_nesting;
  }

  <template>
    {{#if this.canCreateSubcategory}}
      <button
        class="btn btn-default new-subcategory-button"
        {{on "click" this.click}}
        type="button"
      >
        {{~icon "plus"}}
        {{this.label}}
      </button>
    {{/if}}
  </template>
}
