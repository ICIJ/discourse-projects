import Component from "@glimmer/component";
import UserCustomFields from "../../components/user-custom-fields";

export default class UserProfileCustomFieldsConnector extends Component {
  <template><UserCustomFields @user={{@outletArgs.model}} /></template>
}
