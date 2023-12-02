import { getOwner } from "@ember/application";
import { inject as service } from "@ember/service";
import Component from "@glimmer/component";
import I18n from "I18n";

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

  get href() {
    const { id, slug } = this.project.current ?? {};
    return `/c/${slug}/${id}`;
  }

  get name() {
    return this.project?.current?.name;
  }

  get displayProjectBanner() {
    return this.hasProject && this.hasValidRoute;
  }

  get hasProject() {
    return !!this.project.current;
  }

  get hasValidRoute() {
    return !!this.activeRoutes.length && (this.withoutLevel || this.hasValidLevel);
  }

  get hasValidLevel() {
    const min = this.siteSettings.projects_banner_min_level ?? 0;
    const max = this.siteSettings.projects_banner_min_level ?? 4;
    return inRange(this.project?.category?.level, min, max);
  }

  get withoutLevel() {
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

  <template>
    {{#if this.displayProjectBanner}}
      <div class="project-banner__wrapper {{this.safeClass}}">
        {{this.label}} <a href={{this.href}} class="project-banner__wrapper__link">{{this.name}}</a>
      </div>
    {{/if}}
  </template>
}