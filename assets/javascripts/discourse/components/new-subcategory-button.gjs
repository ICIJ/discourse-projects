import { action } from "@ember/object";
import { getOwner } from "@ember/application";
import { inject as service } from "@ember/service";
import { on } from "@ember/modifier";
import Component from "@glimmer/component";
import DiscourseURL from "discourse/lib/url";
import icon from "discourse-common/helpers/d-icon";
import I18n from "I18n";

import ParentCategoryChooser from './modal/parent-category-chooser'

export default class NewSubcategoryButton extends Component {
  @service modal;
  @service site;
  
  @action
  async click() {
    if (this.currentCategory) {
      return DiscourseURL.routeTo(this.href)
    }
    const { categoryId = null } = await this.modal.show(ParentCategoryChooser)
    if (categoryId) {
      return DiscourseURL.routeTo(this.getHref(categoryId))
    }
  }

  @action
  teardown() {
    this.popper?.destroy();
    this.popper = null;
  }

  getHref(parentCategoryId) {
    return `/new-subcategory/${parentCategoryId}`
  }

  get currentCategory() {
    return getOwner(this).lookup("controller:discovery").get('category')
  }

  get currentCategoryLevel() {
    return this.currentCategory.level
  }

  get href() {
    if (this.currentCategory) {
      return this.getHref(this.currentCategory.id)
    }
  }

  get label() {
    return I18n.t('js.subcategory.button.label')
  }

  get canCreateSubcategory() {
    return !this.currentCategory || this.maxCategoryNesting > this.currentCategoryLevel + 1
  }

  get maxCategoryNesting() {
    return this.site.siteSettings.max_category_nesting 
  }

  <template>
    {{#if this.canCreateSubcategory }}
      <button class="btn btn-default new-subcategory-button" {{on "click" this.click}} type="button">
        {{~icon 'plus'}}
        {{this.label}}
      </button>
    {{/if}}
  </template>
}