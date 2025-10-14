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
  @service router;

  shouldRender() {
    return (
      this.siteSettings.projects_addon
    ) && (
      this.router.currentRouteName === "discovery.latest" ||
      this.router.currentRouteName === "discovery.new" ||
      this.router.currentRouteName === "discovery.top" ||
      this.router.currentRouteName === "discovery.posted"
    ) && !!(
      this.outletArgs.topic.project
    );
  }

  get classNames() {
    return this.shouldRender() ? [] : ["hidden"];
  }

  <template>
    {{#if @outletArgs.topic.category.is_project}}
      {{projectLinkHTML
        @outletArgs.topic.category
        extraClasses="project-link--hide-sibling"
      }}
    {{else}}
      {{projectLinkHTML @outletArgs.topic.project}}
    {{/if}}
  </template>
}
