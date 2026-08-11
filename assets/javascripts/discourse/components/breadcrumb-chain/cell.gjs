import Component from "@glimmer/component";
import { htmlSafe } from "@ember/template";
import { categoryLinkHTML } from "discourse/helpers/category-link";
import { i18n } from "discourse-i18n";
import CategoryDrop from "select-kit/components/category-drop";
import ProjectDropdown from "../project-dropdown";

/**
 * One breadcrumb cell, rendered as a split button: the category name links to
 * that category's page, and the caret beside it opens a picker.
 *
 * The link cannot live inside the select-kit header. Its click handler opens with
 * preventDefault() then stopPropagation()
 * (select-kit/components/select-kit/select-kit-header.js:73-75), so an anchor in
 * there would never navigate. It is a sibling instead, and the header is reduced
 * to its caret with showFullTitle.
 */
export default class BreadcrumbChainCell extends Component {
  get category() {
    return this.args.breadcrumb?.category;
  }

  /**
   * categoryLinkHTML builds the href itself, through getURL, so subfolder
   * installs work. allowUncategorized is required: without it the renderer
   * returns an empty string for the uncategorized category
   * (d-category-link.js:44-49) and no anchor renders at all.
   */
  get link() {
    return htmlSafe(
      categoryLinkHTML(this.category, {
        hideParent: true,
        allowUncategorized: true,
        extraClasses: "breadcrumb-chain__link",
      })
    );
  }

  /**
   * Reduce the picker to its caret when the name is already shown as a link.
   * With no category there is no link, so it keeps its own label.
   */
  get dropdownOptions() {
    return {
      showFullTitle: !this.category,
      headerAriaLabel: i18n(
        this.args.isRoot
          ? "js.breadcrumb_chain.switch_project"
          : "js.breadcrumb_chain.switch_category"
      ),
    };
  }

  /**
   * A child caret lists the siblings at its own level, mirroring the root caret,
   * which lists sibling projects. Core already computed that list as the
   * breadcrumb entry's `options` (bread-crumbs.gjs:34-38), so nothing is
   * recomputed here — which also avoids reading site.categories, incomplete when
   * lazy_load_categories is on.
   */
  get childDropdownOptions() {
    return {
      ...this.dropdownOptions,
      subCategory: true,
      parentCategory: this.args.breadcrumb.parentCategory,
    };
  }

  <template>
    <li class="breadcrumb-chain__cell" data-category-id={{this.category.id}}>
      {{#if this.category}}
        {{this.link}}
      {{/if}}
      {{#if @isRoot}}
        <ProjectDropdown
          @category={{this.category}}
          @options={{this.dropdownOptions}}
        />
      {{else}}
        <CategoryDrop
          @category={{this.category}}
          @categories={{@breadcrumb.options}}
          @options={{this.childDropdownOptions}}
        />
      {{/if}}
    </li>
  </template>
}
