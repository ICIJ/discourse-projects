import { createWidget } from "discourse/widgets/widget";
import DiscourseURL from "discourse/lib/url";
import { iconNode } from "discourse-common/lib/icon-library"; 

createWidget("new-subcategory-button", {
  tagName: "button.btn.btn-default",

  click() {
    return DiscourseURL.routeTo(this.href())
  },

  html() {
    return [iconNode('plus'), this.label()]
  },

  currentCategory() {
    return this.container.lookup("controller:discovery").get('category')
  },

  href() {
    if (this.currentCategory()) {
      return `/new-subcategory/${this.currentCategory().id}`
    }
    return '/new-category'
  },

  label() {
    return I18n.t('js.subcategory.new')
  }
});