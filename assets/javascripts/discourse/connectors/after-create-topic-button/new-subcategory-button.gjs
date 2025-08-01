import Component from "@ember/component";
import { service } from "@ember/service";
import { tagName } from "@ember-decorators/component";
import NewSubcategoryButton from "../../components/new-subcategory-button";

@tagName("")
export default class NewSubcategoryButtonConnector extends Component {
  @service currentUser;

  <template>
    {{#if this.currentUser.can_create_category}}
      <NewSubcategoryButton @category={{@outletArgs.category}} />
    {{/if}}
  </template>
}
