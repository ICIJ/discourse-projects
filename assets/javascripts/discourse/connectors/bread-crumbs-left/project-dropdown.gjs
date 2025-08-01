import Component from "@ember/component";
import { get } from "@ember/helper";
import { classNames, tagName } from "@ember-decorators/component";
import ProjectDropdown from "../../components/project-dropdown";

@tagName("li")
@classNames("bread-crumbs-left-outlet", "project-dropdown")
export default class ProjectDropdownConnector extends Component {
  <template>
    <ProjectDropdown
      @category={{get @outletArgs.categoryBreadcrumbs "0.category"}}
    />
  </template>
}
