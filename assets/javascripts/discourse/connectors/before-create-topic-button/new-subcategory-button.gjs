import Component from "@ember/component";
import { computed } from "@ember/object";
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

  @computed("router.currentRouteName")
  get show() {
    return this.canCreateCategory && !this.isDiscoveryCategoriesRoute;
  }

  get canCreateCategory() {
    return this.currentUser?.can_create_category;
  }

  get isDiscoveryCategoriesRoute() {
    return (
      this.router.currentRouteName === "discovery.categories" ||
      this.router.currentRouteName === "discovery.subcategories"
    );
  }

  <template>
    {{#if this.show}}
      <NewSubcategoryButton @category={{@outletArgs.category}} />
    {{/if}}
  </template>
}
