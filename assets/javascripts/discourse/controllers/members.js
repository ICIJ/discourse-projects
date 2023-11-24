import { tracked } from "@glimmer/tracking";
import Controller from "@ember/controller";
import { action, computed } from "@ember/object";
import { sort } from "@ember/object/computed";
import { inject as service } from "@ember/service";
import DiscourseURL from "discourse/lib/url";
import Category from "discourse/models/category";
import NavItem from "discourse/models/nav-item";

export default class MembersController extends Controller {
  @service router;
  @tracked searchTerm = "";
  @tracked order = "username";
  @tracked asc = true;

  @sort("model.members", "sortByFields") members;

  @computed("sortByFields", "searchTerm")
  get filteredMembers() {
    const searchTerm = this.searchTerm.toLowerCase();
    return this.members.filter(({ username, name }) => {
      // No search term, no filter
      if (!searchTerm) {
        return true;
      }
      // We search in serveral fields
      return [username, name].some((value) =>
        value?.toLowerCase().includes(searchTerm)
      );
    });
  }

  @computed("model")
  get category() {
    return this.model.category ?? null;
  }

  @computed("filteredMembers")
  get hasFilteredMembers() {
    return this.filteredMembersCount > 0;
  }

  @computed("filteredMembers")
  get filteredMembersCount() {
    return this.filteredMembers.length;
  }

  @computed("filteredMembers")
  get showMatches() {
    return this.hasFilteredMembers;
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

  @computed("order", "asc")
  get sortByFields() {
    return this.asc ? [`${this.order}:asc`] : [`${this.order}:desc`];
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
