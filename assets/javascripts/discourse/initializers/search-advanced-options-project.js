import { withPluginApi } from "discourse/lib/plugin-api";

// For the sake of simplificy, project prefix can only be "#" and not "category:"
// like the category filter.
const REGEXP_PROJECT_PREFIX = /^(#)/gi;
const REGEXP_PROJECT_SLUG = /^(\#[a-zA-Z0-9\-:]+)/gi;

/**
 * The role of this initializer is to update the search input
 * with the selected terms. Plus, when selecting a subcategory in a project,
 * the search input and the project select are updated too.
 */
function initialize(api) {
  api.modifyClass("component:search-advanced-options", {
    pluginId: "discourse-projects",
    setSearchedTermValueForCategory() {
      this._super(...arguments);
      // We need to extract the current category
      // to review if it's a project or if it belongs to a project
      const category = this.get("searchedTerms.category");

      if (category?.is_project) {
        this.set("searchedTerms.project", category);
        this.set("searchedTerms.category", null);
      } else {
        // If the given category has a project we must set "searchedTerms.project"
        // to reflect the category's project
        this.set("searchedTerms.project", category?.project ?? null);
      }
    },
    _updateSearchTermForProject() {
      let searchTerm = this.searchTerm || "";

      const projectFilter = this.get("searchedTerms.project");
      const match = this.filterBlocks(REGEXP_PROJECT_PREFIX);
      const slugProjectMatches = match[0]?.match(REGEXP_PROJECT_SLUG) ?? null;

      // The project filter is active
      if (projectFilter) {
        const { slug } = projectFilter;
        // There is already a project slug in the search input
        if (slugProjectMatches) {
          // Replace the project slug by the new one
          searchTerm = searchTerm.replace(slugProjectMatches[0], `#${slug}`);
        } else if (slug) {
          // Append the new project slug
          searchTerm += ` #${slug}`;
        }
        // The project filter is NOT active
      } else {
        // There is already a project slug in the search input
        if (slugProjectMatches) {
          // Remove the project slug
          searchTerm = searchTerm.replace(slugProjectMatches[0], "");
        }
      }

      this._updateSearchTerm(searchTerm);
    },
  });
}

export default {
  name: "search-advanced-options-project",
  initialize() {
    withPluginApi(initialize);
  },
};
