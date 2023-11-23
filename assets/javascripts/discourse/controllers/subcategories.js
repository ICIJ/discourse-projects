import Controller from "@ember/controller";
import { action, computed } from "@ember/object";
import { inject as service } from "@ember/service";
import DiscourseURL from "discourse/lib/url";
import Category from "discourse/models/category";
import NavItem from "discourse/models/nav-item";

export default class SubcategoriesController extends Controller {
  @service router;
  @service modal;
  categories = Category.list();

  @computed("categories", "category")
  get subcategories() {
    return this.categories.filter(({ parent_category_id: parent }) => {
      return parent === this.category?.id;
    });
  }

  @computed("subcategories")
  get hasSubcategories() {
    return this.subcategories.length > 0;
  }

  @computed("model")
  get category() {
    return this.model ?? null;
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
