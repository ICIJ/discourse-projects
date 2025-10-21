import Controller from "@ember/controller";
import { action, computed } from "@ember/object";
import { service } from "@ember/service";
import DiscourseURL from "discourse/lib/url";
import Category from "discourse/models/category";

export default class SubcategoriesController extends Controller {
  @service router;

  @computed("model")
  get category() {
    return this.model.category ?? null;
  }

  @computed("model")
  get subcategories() {
    return this.model.subcategories ?? [];
  }

  @computed("subcategories")
  get hasSubcategories() {
    return this.subcategories.length > 0;
  }

  @action
  editCategory() {
    DiscourseURL.routeTo(`/c/${Category.slugFor(this.category)}/edit`);
  }

  @action
  createCategory() {
    this.router.transitionTo("newCategory");
  }
}
