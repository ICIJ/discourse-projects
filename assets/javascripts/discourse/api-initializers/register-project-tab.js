import { apiInitializer } from "discourse/lib/api";
import { i18n } from "discourse-i18n";
import ProjectTab from "../components/project-tab";

/**
 * Registers a primary "Project" tab on the category form. It carries the two
 * linked selectors (required project + optional scoped parent) and is the
 * source of truth for the category's `parent_category_id` and inherited
 * permissions. Gated on the `projects_enabled` site setting.
 */
export default apiInitializer((api) => {
  api.registerEditCategoryTab({
    id: "project",
    name: i18n("subcategory.project_tab"),
    component: ProjectTab,
    primary: true,
    condition: ({ siteSettings }) => siteSettings.projects_enabled,
  });
});
