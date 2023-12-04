import { getOwner } from "@ember/application";
import { htmlSafe } from "@ember/template";
import { inject as service } from "@ember/service";
import Component from "@glimmer/component";
import I18n from "I18n";

import { projectLinkHTML } from "../helpers/project-link";
import ary from "../helpers/ary";
import inRange from "../helpers/in-range";
import trim from "../helpers/trim";



export default class ProjectBanner extends Component {
  @service project;
  @service siteSettings;

  routeNames(route) {
    if (route) {
      return [...this.routeNames(route.parent), route.name];
    }
    return [];
  }

  get currentRoute() {
    const { currentRoute } = getOwner(this).lookup("router:main");
    return this.routeNames(currentRoute);
  }

  get label() {
    return I18n.t('js.project_banner.label');
  }

  get displayProjectBanner() {
    return this.hasProject && this.hasValidRoute;
  }

  get hasProject() {
    return !!this.project.current;
  }

  get hasValidRoute() {
    return !!this.activeRoutes.length && (this.noLevelValidation || this.hasValidLevel);
  }

  get hasValidLevel() {
    const min = this.siteSettings.projects_banner_min_level ?? 0;
    const max = this.siteSettings.projects_banner_max_level ?? 4;
    return inRange(this.project?.category?.level, min, max);
  }

  get noLevelValidation() {
    return this.activeRoutes.some(name => name.endsWith('!'));
  }

  get routes() {
    return this.siteSettings.projects_banner_routes.split('|').map(ary(trim));
  }

  get activeRoutes() {
    return this.routes.filter((name) => {
      return this.currentRoute.includes(trim(name, '!'));
    });
  }

  get safeProjectLink() {
    const options = { extraClasses: "project-banner__wrapper__link" };
    return htmlSafe(projectLinkHTML(this.project.current, options));
  }

  <template>
    {{#if this.displayProjectBanner}}
      <div class="project-banner__wrapper {{this.safeClass}}">
        {{this.label}} {{this.safeProjectLink}}
      </div>
    {{/if}}
  </template>
}