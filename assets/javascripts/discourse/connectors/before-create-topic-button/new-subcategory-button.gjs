import Component from "@ember/component";
import { computed } from "@ember/object";
import { service } from "@ember/service";
import { tagName } from "@ember-decorators/component";
import NewSubcategoryButton from "../../components/new-subcategory-button";

@tagName("")
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
    return this.router.currentRouteName === "discovery.categories";
  }

  <template>
    {{#if this.show}}
      <NewSubcategoryButton @category={{@outletArgs.category}} />
    {{/if}}
  </template>
}
