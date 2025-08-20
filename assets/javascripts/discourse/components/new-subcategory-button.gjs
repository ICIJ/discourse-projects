import Component from "@glimmer/component";
import { on } from "@ember/modifier";
import { action } from "@ember/object";
import { service } from "@ember/service";
import icon from "discourse/helpers/d-icon";
import { i18n } from "discourse-i18n";

export default class NewSubcategoryButton extends Component {
  @service modal;
  @service site;
  @service siteSettings;
  @service newSubcategoryModal;

  @action
  async click() {
    return this.newSubcategoryModal.create(this.currentCategory);
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
