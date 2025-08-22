import Component from "@ember/component";
import { service } from "@ember/service";
import ProjectBanner from "../../components/project-banner";

/**
 * This connector renders the project banner component above the
 * main container if the site setting is enabled.
 */
export default class ProjectBannerConnector extends Component {
  @service siteSettings;

  shouldRender() {
    return !!this.siteSettings.project_banner_enabled;
  }

  get position() {
    return this.siteSettings.projects_banner_sticky ? "sticky" : "static";
  }

  get classNames() {
    return ["project-banner", `project-banner--${this.position}`];
  }

  <template><ProjectBanner /></template>
}
