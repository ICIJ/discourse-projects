import Component from "@glimmer/component";
import { service } from "@ember/service";
import ProjectDropdown from "./project-dropdown";

/**
 * Wrapper component that renders the project dropdown in the breadcrumbs.
 * Renders an <li> element with the dropdown when enabled.
 */
export default class ProjectDropdownBreadcrumb extends Component {
  @service siteSettings;

  get category() {
    return this.args.outletArgs?.categoryBreadcrumbs?.[0]?.category;
  }

  get shouldRender() {
    return this.siteSettings.projects_breadcrumb_project_dropdown;
  }

  <template>
    {{#if this.shouldRender}}
      <li class="bread-crumbs-left-outlet project-dropdown">
        <ProjectDropdown @category={{this.category}} />
      </li>
    {{/if}}
  </template>
}
