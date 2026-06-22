import Service, { service } from "@ember/service";
import { disableImplicitInjections } from "discourse/lib/implicit-injections";
import ParentCategoryChooser from "../components/modal/parent-category-chooser";

@disableImplicitInjections
export default class NewSubcategory extends Service {
  @service modal;
  @service router;
  @service project;

  async create(currentCategory) {
    if (currentCategory) {
      return this.routeToNewCategory(currentCategory.id);
    }
    const { categoryId = null } = await this.modal.show(ParentCategoryChooser);
    if (categoryId) {
      return this.routeToNewCategory(categoryId);
    }
  }

  routeToNewCategory(parentCategoryId) {
    this.project.pendingParentCategoryId = parentCategoryId;
    return this.router.transitionTo("newCategory.setup");
  }
}
