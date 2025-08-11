import { tracked } from '@glimmer/tracking';
import { getOwner } from "@ember/application";
import Service, { service } from "@ember/service";
import { disableImplicitInjections } from "discourse/lib/implicit-injections";
import Category from "discourse/models/category";
import isDefined from "../helpers/is-defined";
import Project from "../models/Project";

/**
 * The ProjectService tries to guess the current project
 * of the route (based first on route params, then on the topic controller).
 */
@disableImplicitInjections
export default class ProjectService extends Service {
  @service router;
  @service store;

  @tracked all = [];

  async init() {
    super.init(...arguments);
    // Load all projects from the server once
    // and store them in the `all` property.
    this.all.push(...await Project.findAll());
  }

  findById(id) {
    return this.all.find((project) => project.id === id);
  }


  /**
   * Gets the current category.
   *
   * This function looks up the current route parameters and attempts to find the category
   * either by ID, slug, or slug path with ID. If none is given, the function
   * will use the topic controller model.
   *
   * @param {Object} container - The application's container instance.
   * @returns {Category|null} - The found category or null if not found.
   */
  get category() {
    // Destructure for cleaner access
    const { category_id, category_slug, category_slug_path_with_id } =
      this.routeParams(this.router.currentRoute);

    if (isDefined(category_id)) {
      return Category.findById(category_id);
    }

    if (isDefined(category_slug)) {
      return Category.findSingleBySlug(category_slug);
    }

    if (isDefined(category_slug_path_with_id)) {
      return Category.findBySlugPathWithID(category_slug_path_with_id);
    }

    return getOwner(this).lookup("controller:topic")?.get("model.category");
  }

  /**
   * Gets the current project.
   *
   * This function looks up the current category or its related project
   *
   * @param {Object} container - The application's container instance.
   * @returns {Category|null} - The found prohect or null if not found.
   */
  get current() {
    if (this.category?.is_project) {
      return this.category;
    }
    return this.category?.project ?? null;
  }

  /**
   * Recursively retrieves route parameters from the given route and its parent routes.
   *
   * This function collects route parameters from the specified route and merges them with
   * parameters from its parent routes, if any.
   *
   * @param {Object} route - The route from which to gather parameters.
   * @return {Object} - An aggregated object of parameters from the given route and its parents.
   */
  routeParams(route) {
    const parentParams = route.parent ? this.routeParams(route.parent) : {};
    return { ...parentParams, ...route.params };
  }
}
