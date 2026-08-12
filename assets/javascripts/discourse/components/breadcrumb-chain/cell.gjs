import Component from "@glimmer/component";
import { htmlSafe } from "@ember/template";
import { categoryLinkHTML } from "discourse/helpers/category-link";
import { i18n } from "discourse-i18n";
import ProjectDropdown from "../project-dropdown";
import BlankSelectedName from "./blank-selected-name";
import SiblingDropdown from "./sibling-dropdown";

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
   *
   * The category cell's label is interpolated so several carets in a row don't
   * all announce the same "Switch category" name to a screen reader. This
   * mirrors how core's own header names each caret after its own category
   * (select_kit.filter_by: "Filter by: %{name}").
   *
   * Collapsing the header this way does not stop it from rendering an icon:
   * select-kit's own selected-name.gjs draws `item.icon` even when
   * showFullTitle is false, regardless of the category's style_type. For a
   * category styled with an icon rather than a color square, that duplicates
   * the icon the link next to it already shows via categoryLinkHTML.
   * BlankSelectedName replaces the header's selectedNameComponent whenever it
   * is collapsed, so that render has nothing left to draw.
   */
  get dropdownOptions() {
    const showFullTitle = !this.category;

    const options = {
      showFullTitle,
      headerAriaLabel: this.args.isRoot
        ? i18n("js.breadcrumb_chain.switch_project")
        : i18n("js.breadcrumb_chain.switch_category", {
            categoryName: this.category.displayName,
          }),
    };

    if (!showFullTitle) {
      options.selectedNameComponent = BlankSelectedName;
    }

    return options;
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
        {{! @tag keeps an active tag filter across a sibling switch instead of
          landing on the unfiltered category (getCategoryAndTagUrl builds the
          URL from whatever tag it is given, url.js:582-592). }}
        <SiblingDropdown
          @category={{this.category}}
          @categories={{@breadcrumb.options}}
          @tag={{@tag}}
          @options={{this.childDropdownOptions}}
        />
      {{/if}}
    </li>
  </template>
}
