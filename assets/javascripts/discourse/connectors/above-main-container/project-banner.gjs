import Component from "@ember/component";
import { service } from "@ember/service";
import { classNames } from "@ember-decorators/component";
import ProjectBanner from "../../components/project-banner";

@classNames("above-main-container-outlet", "project-banner")
export default class ProjectBannerConnector extends Component {
  @service siteSettings;

  shouldRender() {
    return !!this.siteSettings.project_banner_enabled;
  }

  position(_args, component) {
    const { siteSettings } = component.site;
    const position = siteSettings.projects_banner_sticky
      ? "sticky"
      : "static";
    return position;
  }

  <template>
    <ProjectBanner />
  </template>
}
