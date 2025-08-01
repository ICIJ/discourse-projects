import Component from "@glimmer/component";
import { on } from "@ember/modifier";
import { action } from "@ember/object";
import { service } from "@ember/service";
import icon from "discourse/helpers/d-icon";
import DiscourseURL from "discourse/lib/url";
import { i18n } from "discourse-i18n";
import ParentCategoryChooser from "./modal/parent-category-chooser";

export default class NewSubcategoryButton extends Component {
  @service modal;
  @service site;
  @service siteSettings;

  @action
  async click() {
    if (this.currentCategory) {
      return DiscourseURL.routeTo(this.href);
    }
    const { categoryId = null } = await this.modal.show(ParentCategoryChooser);
    if (categoryId) {
      return DiscourseURL.routeTo(this.getHref(categoryId));
    }
  }

  @action
  teardown() {
    this.popper?.destroy();
    this.popper = null;
  }

  getHref(parentCategoryId) {
    return `/new-subcategory/${parentCategoryId}`;
  }

  get currentCategory() {
    return this.args.category ?? null;
  }

  get currentCategoryLevel() {
    return this.currentCategory?.level;
  }

  get href() {
    if (this.currentCategory) {
      return this.getHref(this.currentCategory.id);
    }
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
