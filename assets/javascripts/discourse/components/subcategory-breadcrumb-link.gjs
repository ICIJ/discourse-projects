import Component from "@glimmer/component";
import { service } from "@ember/service";
import { htmlSafe } from "@ember/template";
import { categoryLinkHTML } from "discourse/helpers/category-link";

/**
 * Renders categories as simple links (not dropdowns) for use
 * in the breadcrumb when projects_breadcrumb_subcategory_links is enabled.
 *
 * When projects_breadcrumb_project_dropdown is enabled:
 *   Project (dropdown) > Subcategory1 (link) > Subcategory2 (link)
 *
 * When projects_breadcrumb_project_dropdown is disabled:
 *   Project (link) > Subcategory1 (link) > Subcategory2 (link)
 *
 * Note: The bread-crumbs-right outlet is rendered inside a loop in Discourse core,
 * so this component may be instantiated multiple times. A hidden marker element is
 * added at the end of each render, and CSS hides any elements after the first marker
 * to prevent duplicate links from appearing.
 */
export default class SubcategoryBreadcrumbLink extends Component {
  /**
   * Map route names to URL suffixes
   */
  static ROUTE_SUFFIX_MAP = {
    "discovery.subcategories": "/subcategories",
    "discovery.latestCategory": "/l/latest",
    "discovery.topCategory": "/l/top",
    "discovery.newCategory": "/l/new",
    "discovery.unreadCategory": "/l/unread",
    "discovery.postedCategory": "/l/posted",
    "discovery.hotCategory": "/l/hot",
  };

  @service siteSettings;
  @service router;
  @service site;

  /**
   * Build a category URL with the current page suffix preserved
   */
  categoryUrl = (category) => {
    // Build the base category URL
    let url = `/c/${category.slug}/${category.id}`;
    // Append the current page suffix
    return url + this.pageSuffix;
  };

  /**
   * Build category link HTML with preserved page suffix.
   * Uses categoryLinkHTML with link:false to get the badge without a link,
   * then wraps it in a custom anchor with the correct URL.
   */
  categoryLink = (category) => {
    const url = this.categoryUrl(category);
    // Get the badge HTML without a link
    const badgeHtml = categoryLinkHTML(category, {
      link: false,
      allowUncategorized: true,
      hideParent: true,
    });
    // Wrap the badge in a link with the custom URL
    // badgeHtml is a SafeString, convert to string with toString()
    return htmlSafe(`<a href="${url}">${badgeHtml.toString()}</a>`);
  };

  get pageSuffix() {
    const routeName = this.router.currentRouteName;
    return SubcategoryBreadcrumbLink.ROUTE_SUFFIX_MAP[routeName] || "";
  }

  get pageCategory() {
    // First try to get category from router attributes (works on most category pages)
    let category = this.router.currentRoute?.attributes?.category;
    if (category) {
      return category;
    }

    // Fallback: extract category ID from router URL and look it up in site.categories
    // This is needed for routes like discovery.subcategories where the category
    // isn't in router attributes
    const url = this.router.currentURL;
    const match = url.match(/\/c\/.*\/(\d+)/);
    if (match) {
      const categoryId = parseInt(match[1], 10);
      category = this.site.categories?.find((c) => c.id === categoryId);
    }

    return category;
  }

  get subcategoryLinks() {
    if (!this.siteSettings.projects_breadcrumb_subcategory_links) {
      return [];
    }

    const pageCategory = this.pageCategory;
    if (!pageCategory) {
      return [];
    }

    // In Discourse, ancestors includes all parent categories AND the current category itself
    const ancestors = pageCategory.ancestors || [];

    if (ancestors.length === 0) {
      return [];
    }

    // When project dropdown is enabled, skip the first ancestor (the project)
    if (this.siteSettings.projects_breadcrumb_project_dropdown) {
      // Skip the project, only show subcategories as links
      if (ancestors.length <= 1) {
        return [];
      }
      return ancestors.slice(1);
      // When project dropdown is disabled, include all ancestors as links
    } else {
      // Show all categories as links, including the project
      return ancestors;
    }
  }

  get hasSubcategoryLinks() {
    return this.subcategoryLinks.length > 0;
  }

  <template>
    {{#if this.hasSubcategoryLinks}}
      {{#each this.subcategoryLinks as |category|}}
        <li class="breadcrumb-subcategory-link">
          {{this.categoryLink category}}
        </li>
      {{/each}}
      <li
        class="breadcrumb-subcategory-links-end"
        hidden
        aria-hidden="true"
      ></li>
    {{/if}}
  </template>
}
