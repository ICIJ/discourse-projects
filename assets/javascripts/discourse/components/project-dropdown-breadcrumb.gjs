import Component from "@glimmer/component";
import { service } from "@ember/service";
import { htmlSafe } from "@ember/template";
import { categoryLinkHTML } from "discourse/helpers/category-link";
import { i18n } from "discourse-i18n";
import ProjectDropdown from "./project-dropdown";

/**
 * Renders the project cell in the breadcrumbs as a split button: the project
 * name links to the project's own page, and the caret beside it opens the
 * project switcher.
 *
 * The link cannot live inside the select-kit header: its click handler opens
 * with preventDefault() and stopPropagation()
 * (select-kit/components/select-kit/select-kit-header.js:73-75), so an anchor
 * in there would never navigate. It is a sibling instead, and the header is
 * collapsed to its caret with showFullTitle.
 */
export default class ProjectDropdownBreadcrumb extends Component {
  @service siteSettings;

  get category() {
    return this.args.outletArgs?.categoryBreadcrumbs?.[0]?.category;
  }

  get shouldRender() {
    return this.siteSettings.projects_breadcrumb_project_dropdown;
  }

  /**
   * The project name as a link to the project's page. categoryLinkHTML builds
   * the href itself, through getURL, so subfolder installs work.
   */
  get projectHomeLink() {
    return htmlSafe(
      categoryLinkHTML(this.category, {
        hideParent: true,
        allowUncategorized: true,
        extraClasses: "project-dropdown__home",
      })
    );
  }

  /**
   * Reduce the dropdown to its caret when the name is already shown as a link.
   * Without a project there is no link, so the dropdown keeps its own label.
   */
  get dropdownOptions() {
    return {
      showFullTitle: !this.category,
      headerAriaLabel: i18n("js.project_dropdown.switch"),
    };
  }

  <template>
    {{#if this.shouldRender}}
      <li class="bread-crumbs-left-outlet project-dropdown">
        {{#if this.category}}
          {{this.projectHomeLink}}
        {{/if}}
        <ProjectDropdown
          @category={{this.category}}
          @options={{this.dropdownOptions}}
        />
      </li>
    {{/if}}
  </template>
}
