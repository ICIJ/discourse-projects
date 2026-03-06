import Component from "@glimmer/component";
import UserCustomFields from "../../components/user-custom-fields";

export default class UserCardCustomFieldsConnector extends Component {
  <template><UserCustomFields @user={{@outletArgs.user}} /></template>
}
