import { apiInitializer } from "discourse/lib/api";
import { i18n } from "discourse-i18n";
import ProjectTab from "../components/project-tab";

/**
 * Registers a primary "Project" tab on the category form. It carries the two
 * linked selectors (required project + optional scoped parent) and is the
 * source of truth for the category's `parent_category_id` and inherited
 * permissions.
 *
 * No `condition` is set: the plugin's assets only load when `projects_enabled`
 * is on (`enabled_site_setting :projects_enabled`), so the tab can never
 * register while the plugin is disabled. A `condition` reading
 * `siteSettings.projects_enabled` was evaluating falsy in the tab-bar render
 * context and hiding the tab entirely.
 */
export default apiInitializer((api) => {
  api.registerEditCategoryTab({
    id: "project",
    name: i18n("subcategory.project_tab"),
    component: ProjectTab,
    primary: true,
  });
});
