import Component from "@glimmer/component";
import { service } from "@ember/service";
import { projectLinkHTML } from "../../helpers/project-link";

// This connector adds a project badge below the category title link
// on both /categories and subcategories pages when the category
// belongs to a project.
export default class ProjectBadgeConnector extends Component {
  @service router;

  get shouldRender() {
    const routeName = this.router.currentRouteName;
    const isRelevantPage = routeName === "discovery.categories";

    return isRelevantPage && !!this.args.outletArgs.category?.project;
  }

  <template>
    {{#if this.shouldRender}}
      <span class="category-project-badge">
        {{projectLinkHTML
          @outletArgs.category.project
          extraClasses="project-link--badge"
        }}
      </span>
    {{/if}}
  </template>
}
