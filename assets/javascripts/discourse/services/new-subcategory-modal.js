import Service, { service } from "@ember/service";
import { disableImplicitInjections } from "discourse/lib/implicit-injections";
import DiscourseURL from "discourse/lib/url";
import ParentCategoryChooser from "../components/modal/parent-category-chooser";

@disableImplicitInjections
export default class NewSubcategory extends Service {
  @service modal;

  async create(currentCategory) {
    if (currentCategory) {
      const href = this.getHref(currentCategory.id);
      return DiscourseURL.routeTo(href);
    }
    const { categoryId = null } = await this.modal.show(ParentCategoryChooser);
    if (categoryId) {
      return DiscourseURL.routeTo(this.getHref(categoryId));
    }
  }

  getHref(parentCategoryId) {
    return `/new-subcategory/${parentCategoryId}`;
  }
}
