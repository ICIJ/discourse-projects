import Component from "@ember/component";
import { computed } from "@ember/object";
import { classNameBindings } from "@ember-decorators/component";
import { tracked } from "@glimmer/tracking";
import { service } from "@ember/service";
import discourseComputed from "discourse/lib/decorators";
import CategoryList from "discourse/models/category-list";
import NewSubcategoryButton from "../../components/new-subcategory-button";
import iteratee from "../../helpers/iteratee";

/**
 * This connector renders the new subcategory button
 * before the create topic button if the user has permission
 * to create a category and if the current route is not the
 * discovery categories route (which already contains a button)
 */
@classNameBindings("classList")
export default class NewSubcategoryButtonConnector extends Component {
  @service currentUser;
  @service router;
  @service store;

  @tracked shouldRender = false;

  async init() {
    super.init(...arguments);
    // Determine if we should render the new subcategory button according
    // to the current route and the result of canCreateCategory which is an
    // async function using the category list to check permissions.
    this.shouldRender = !this.isDiscoveryCategoriesRoute && await this.canCreateCategory();
  }

  canCreateCategory() {
    return CategoryList
      .list(this.store)
      .then(iteratee("can_create_category"))
  }

  @discourseComputed("router.currentRouteName")
  isDiscoveryCategoriesRoute(currentRouteName) {
    const routes = ["discovery.categories", "discovery.subcategories"];
    return routes.includes(currentRouteName);
  }

  @computed("shouldRender")
  get classList() {
    return this.shouldRender ? [] : ["hidden"]
  }

  <template>
    {{#if this.shouldRender}}
      <NewSubcategoryButton @category={{@outletArgs.category}} />
    {{/if}}
  </template>
}
