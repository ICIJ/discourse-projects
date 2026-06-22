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
    // If the transition is aborted before route:new-category's model() consumes
    // the stash, clear it so a later top-level creation isn't polluted.
    return this.router.transitionTo("newCategory.setup").catch(() => {
      this.project.pendingParentCategoryId = null;
    });
  }
}
