import Component from "@ember/component";
import { computed } from "@ember/object";
import discourseComputed from "discourse/lib/decorators";
import { service } from "@ember/service";
import NewSubcategoryButton from "../../components/new-subcategory-button";

/**
 * This connector renders the new subcategory button
 * before the create topic button if the user has permission
 * to create a category and if the current route is not the
 * discovery categories route (which already contains a button)
 */
export default class NewSubcategoryButtonConnector extends Component {
  @service currentUser;
  @service router;

  shouldRender() {
    return this.canCreateCategory && !this.isDiscoveryCategoriesRoute;
  }

  @discourseComputed("currentUser")
  canCreateCategory(currentUser) {
    return currentUser?.can_create_category;
  }

  @discourseComputed("router.currentRouteName")
  isDiscoveryCategoriesRoute(currentRouteName) {
    const routes = ["discovery.categories", "discovery.subcategories"];
    return routes.includes(currentRouteName);
  }

  get classNames() {
    return this.shouldRender() ? [] : ["hidden"];
  }

  <template>
    {{#if this.shouldRender}}
      <NewSubcategoryButton @category={{@outletArgs.category}} />
    {{/if}}
  </template>
}