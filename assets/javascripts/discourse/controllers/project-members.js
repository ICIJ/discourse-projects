import Controller from "@ember/controller";
import { action } from "@ember/object";
import { gt } from "@ember/object/computed";
import { service } from "@ember/service";
import { observes } from "@ember-decorators/object";
import discourseComputed, { debounce } from "discourse/lib/decorators";
import DiscourseURL from "discourse/lib/url";
import Category from "discourse/models/category";
import NavItem from "discourse/models/nav-item";

export default class ProjectMembersController extends Controller {
  @service router;

  order = "username";
  asc = true;
  filter = null;
  filterInput = null;
  loading = false;

  @gt("model.members.length", 0) hasMembers;

  get canLoadMore() {
    return this.members.length < this.membersTotal;
  }

  @discourseComputed("filter", "members.length", "model.limit", "asc")
  memberParams(filter, membersLength, limit, asc) {
    const offset = membersLength ?? 0;
    return { filter, offset, limit, asc };
  }

  async loadMembers(refresh = false) {
    if (this.loading || !this.model || (!refresh && !this.canLoadMore)) {
      return;
    }

    this.set("loading", true);
    await this.model.loadMembers(this.memberParams, refresh);
    this.set("loading", false);
  }

  @action
  loadMoreMembers() {
    return this.loadMembers(false);
  }

  @action
  reloadMembers() {
    return this.loadMembers(true);
  }

  @action
  updateOrder(order, asc) {
    this.setProperties({ order, asc });
  }

  @action
  editCategory() {
    DiscourseURL.routeTo(`/c/${Category.slugFor(this.category)}/edit`);
  }

  @action
  createCategory() {
    this.router.transitionTo("newCategory");
  }

  @debounce(500)
  setFilter() {
    this.set("filter", this.filterInput);
  }

  @observes("filterInput")
  filterInputChanged() {
    this.setFilter();
  }

  @observes("filter", "asc")
  memberParamsChanged() {
    this.reloadMembers();
  }

  @discourseComputed("loading", "filter", "filterInput")
  iddle(loading, filter, filterInput) {
    return !loading && filter === filterInput;
  }

  @discourseComputed("hasMembers", "iddle")
  showTotal(hasMembers, iddle) {
    return hasMembers && iddle;
  }

  @discourseComputed("model")
  category(model) {
    return model.asCategory;
  }

  @discourseComputed("model.members")
  members(members) {
    return members;
  }

  @discourseComputed("model.members_count")
  membersTotal(count) {
    return count;
  }

  @discourseComputed("category")
  navItems(category) {
    return NavItem.buildList(category, {
      filterType: "latest",
      noSubcategories: false,
      currentRouteQueryParams: this.router.currentRoute.queryParams,
      tagId: null,
      siteSettings: this.siteSettings,
      skipCategoriesNavItem: true,
    });
  }
}
