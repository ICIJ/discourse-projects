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
      return this.content;
    }
    return Project.asyncSearch(filter);
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
    const slug = this.castValue.slug;
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
   * Whether clearing the dropdown should navigate to the projects page.
   */
  get shouldRouteToProjects() {
    return this.siteSettings.projects_home_logo_to_projects;
  }

  /**
   * Build the route for a given category, preserving the current tab.
   */
  routeForCategory(categoryId) {
    const category = Category.findById(parseInt(categoryId, 10));
    return category ? category.path + this.currentTabSuffix : null;
  }

  @action
  onChange(categoryId) {
    if (!categoryId && this.shouldRouteToProjects) {
      DiscourseURL.routeToUrl("/projects");
      return;
    }

    const route = categoryId ? this.routeForCategory(categoryId) : null;
    // If we have a valid route for the selected category, navigate to it. Otherwise, fallback to the default behavior.
    return route ? DiscourseURL.routeToUrl(route) : super.onChange(categoryId);
  }
}
