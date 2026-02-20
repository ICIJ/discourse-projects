import { action, computed } from "@ember/object";
import { service } from "@ember/service";
import { classNames } from "@ember-decorators/component";
import DiscourseURL from "discourse/lib/url";
import Category from "discourse/models/category";
import { i18n } from "discourse-i18n";
import CategoryDrop from "select-kit/components/category-drop";
import {
  pluginApiIdentifiers,
  selectKitOptions,
} from "select-kit/components/select-kit";
import Project from "../models/Project";
import ProjectDropdownSelectedName from "./project-dropdown/project-dropdown-selected-name";

@pluginApiIdentifiers(["project-dropdown"])
@classNames("category-drop")
@selectKitOptions({
  clearable: true,
  selectedNameComponent: ProjectDropdownSelectedName,
  filterPlaceholder: "project_dropdown.placeholder",
})
export default class ProjectDropdown extends CategoryDrop {
  @service project;
  @service router;
  @service siteSettings;

  noCategoriesLabel = i18n("js.project_dropdown.select");

  /**
   * Override the default search behavior to use our custom search method that only returns 
   * projects. This ensures that the dropdown only shows projects and not regular categories.
   */
  async search(filter = "") {
    if (!filter) {
      return this.content
    }
    return Project.asyncSearch(filter)
  }

  /**
   * The content of the dropdown is all categories that are projects. This is 
   * provided by the project service which caches this list for performance. By using 
   * a computed property, we ensure that the dropdown updates automatically when the 
   * list of projects changes.
   */
  @computed("project.all")
  get content() {
    return this.project.all;
  }

  /**
   * Cast the selected value to an actual category object so we can access its properties
   */
  get castValue() {
    return this.value ? Category.findById(this.value) : null;
  }

  /**
   * The current URL path without query params.
   */
  get currentPath() {
    return this.router.currentURL?.split("?")[0] ?? "";
  }

  /**
   * The suffix after the last numeric category ID in the URL.
   * e.g. /c/bar/1441/court-records/993/subcategories → /subcategories
   */
  get suffixAfterLastId() {
    return this.currentPath.match(/\/\d+(\/.+)$/)?.[1] ?? null;
  }

  /**
   * Fallback suffix for URLs without numeric IDs (e.g. /c/foo/members).
   * Strips everything up to and including the category slug.
   */
  get suffixAfterSlug() {
    if (!this.castValue?.slug) {
      return null;
    }
    const slug = this.castValue.slug
    const idx = this.currentPath.lastIndexOf(`/${slug}`);
    return idx !== -1 ? this.currentPath.slice(idx + slug.length + 1) : null;
  }

  /**
   * The current tab suffix to preserve when switching projects.
   */
  get currentTabSuffix() {
    return this.suffixAfterLastId ?? this.suffixAfterSlug ?? "";
  }

  /**
   * When the user clears the dropdown and the setting `projects_home_logo_to_projects` is enabled,
   * we want to route them to the projects home page. Otherwise, we fallback to the default
   * behavior of clearing the category selection.
   *
   * When selecting a project, navigate to the same tab (categories, latest, etc.)
   * that the user is currently viewing.
   */
  @action
  onChange(categoryId) {
    if (!categoryId && this.siteSettings.projects_home_logo_to_projects) {
      DiscourseURL.routeToUrl("/projects");
      return;
    }

    if (categoryId) {
      const category = Category.findById(parseInt(categoryId, 10));
      if (category) {
        const route = category.path + this.currentTabSuffix;
        DiscourseURL.routeToUrl(route);
        return;
      }
    }

    super.onChange(categoryId);
  }
}
