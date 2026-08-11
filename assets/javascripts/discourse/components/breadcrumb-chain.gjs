import Component from "@glimmer/component";
import { service } from "@ember/service";
import BreadcrumbChainCell from "./breadcrumb-chain/cell";

/**
 * Renders the breadcrumb category trail as split buttons.
 *
 * Rendered into bread-crumbs-left, which is instantiated once. Modern .gjs
 * connectors control their own DOM and ignore @connectorTagName
 * (plugin-outlet.gjs:231-233), so this emits its own <li> per level directly
 * inside <ol class="category-breadcrumb">.
 */
export default class BreadcrumbChain extends Component {
  @service siteSettings;

  /**
   * Core computes one entry per level and passes it to the outlet, each carrying
   * that level's category, its parent, and `options` — the siblings at that level
   * (bread-crumbs.gjs:21-45). Entries with no category are core's trailing
   * "pick a subcategory" placeholder, which this plugin does not render.
   */
  get cells() {
    return (this.args.outletArgs?.categoryBreadcrumbs ?? []).filter(
      (breadcrumb) => breadcrumb.category
    );
  }

  /**
   * Undefined on a page with no category at all, e.g. /latest. The cell still
   * renders in that state, showing the project picker with its own label.
   */
  get rootCell() {
    return this.cells[0];
  }

  get shouldRender() {
    return this.siteSettings.projects_breadcrumb_project_dropdown;
  }

  /**
   * Child cells are opt-in. With the setting off, the chain renders the root cell
   * alone and core's own child dropdowns show through untouched.
   */
  get childCells() {
    return this.siteSettings.projects_breadcrumb_subcategory_links
      ? this.cells.slice(1)
      : [];
  }

  <template>
    {{#if this.shouldRender}}
      <BreadcrumbChainCell @breadcrumb={{this.rootCell}} @isRoot={{true}} />
      {{#each this.childCells as |breadcrumb|}}
        <BreadcrumbChainCell @breadcrumb={{breadcrumb}} />
      {{/each}}
    {{/if}}
  </template>
}
