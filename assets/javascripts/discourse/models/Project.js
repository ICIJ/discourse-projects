import { tracked } from "@glimmer/tracking";
import { ajax } from "discourse/lib/ajax";
import PreloadStore from "discourse/lib/preload-store";
import Category from "discourse/models/category";
import CategoryList from "discourse/models/category-list";
import Site from "discourse/models/site";
import iteratee from "../helpers/iteratee";

export default class Project {
  static async findAll() {
    try {
      const pre = await PreloadStore.getAndRemove("projects");
      const projects =
        pre ?? (await ajax("/projects.json").then(iteratee("projects")));

      return projects.map((p) => Site.current().updateCategory(p));
    } catch {
      return [];
    }
  }

  static loadMembers(name, data) {
    return ajax(`/projects/${name}/members.json`, { data });
  }

  static async findList() {
    const projects = await Project.findAll();
    const list = CategoryList.create();
    projects.forEach((p) => list.pushObject(p));
    return list;
  }

  static async asyncSearch(filter = "") {
    const projects = await Project.findAll();
    const needle = filter.toLowerCase().trim();
    const match = ({ name, slug }) => {
      return (
        !filter ||
        name.toLowerCase().includes(needle) ||
        slug.toLowerCase().includes(needle)
      );
    };
    return projects.filter(match);
  }

  static create(args = {}) {
    return new Project(args);
  }

  @tracked members = [];
  @tracked members_count = 0;
  @tracked limit = 50;
  @tracked offset = 0;
  @tracked slug = null;

  constructor(args) {
    Object.assign(this, args);
  }

  get asCategory() {
    return Category.findSingleBySlug(this.slug);
  }

  async find() {
    return ajax(`/projects/${this.slug}.json`);
  }

  async load() {
    const { project } = await this.find();
    Object.assign(this, project);
    return this;
  }

  async loadMembers(
    { limit = 50, offset = 0, filter = null, asc = true } = {},
    refresh = false
  ) {
    // Always reset offset to 0 when refreshing
    const data = { limit, offset: refresh ? 0 : offset, filter, asc };
    const response = await Project.loadMembers(this.slug, data);
    // If refreshing...
    this.members = refresh
      ? // * replace members
        response.members
      : // * otherwise append members*
        [...this.members, ...response.members];
    // We update the model to reflect the new members count, limit and offset
    this.members_count = response.meta.total;
    this.limit = response.meta.limit;
    this.offset = response.meta.offset;
    return this.members;
  }
}
