import Component from "@ember/component";
import { service } from "@ember/service";
import ComposerProjectChooser from "../../components/composer-project-chooser";

export default class ComposerProjectChooserConnector extends Component {
  @service siteSettings;

  shouldRender() {
    return !!this.siteSettings.projects_composer_project_chooser;
  }

  <template>
    <ComposerProjectChooser @composer={{@outletArgs.composer}} />
  </template>
}
