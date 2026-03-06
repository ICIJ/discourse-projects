import Component from "@glimmer/component";
import icon from "discourse/helpers/d-icon";

export default class UserCustomFields extends Component {
  get organization() {
    return this.args.user?.custom_fields?.organization;
  }

  get country() {
    return this.args.user?.custom_fields?.country;
  }

  <template>
    {{#if this.organization}}
      <span class="user-custom-field user-custom-field--organization">
        {{icon "briefcase"}}
        <span>{{this.organization}}</span>
      </span>
    {{/if}}
    {{#if this.country}}
      <span class="user-custom-field user-custom-field--country">
        {{icon "earth-americas"}}
        <span>{{this.country}}</span>
      </span>
    {{/if}}
  </template>
}
