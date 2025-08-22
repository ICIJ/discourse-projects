import Component from "@ember/component";
import { service } from "@ember/service";
import { projectLinkHTML } from "../../helpers/project-link";

/**
 * This connector adds a project link in the topic list
 * before the category name if the site setting is enabled
 * and if the topic belongs to a project category.
 */
export default class ProjectAddonConnector extends Component {
  @service siteSettings;

  shouldRender() {
    const { topic } = this.outletArgs;
    const { category = null } = topic ?? {};
    const isProject = category && (category.project || category.is_project);
    return !!this.siteSettings.projects_addon && isProject;
  }

  get classNames() {
    return this.shouldRender() ? [] : ["hidden"];
  }

  <template>
    {{#if @outletArgs.topic.category.project}}
      {{projectLinkHTML @outletArgs.topic.category.project}}
    {{else if @outletArgs.topic.category.is_project}}
      {{projectLinkHTML
        @outletArgs.topic.category
        extraClasses="project-link--hide-sibling"
      }}
    {{/if}}
  </template>
}
