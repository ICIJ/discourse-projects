import Controller from "@ember/controller";
import { action, computed } from "@ember/object";
import { service } from "@ember/service";
import DiscourseURL from "discourse/lib/url";
import Category from "discourse/models/category";
import NavItem from "discourse/models/nav-item";

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

  @computed("category")
  get navItems() {
    return NavItem.buildList(this.category, {
      filterType: "latest",
      noSubcategories: false,
      currentRouteQueryParams: this.router.currentRoute.queryParams,
      tagId: null,
      siteSettings: this.siteSettings,
      skipCategoriesNavItem: true,
    });
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
