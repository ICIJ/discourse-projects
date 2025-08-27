import { ajax } from "discourse/lib/ajax";
import PreloadStore from "discourse/lib/preload-store";
import Category from "discourse/models/category";
import CategoryList from "discourse/models/category-list";
import RestModel from "discourse/models/rest"
import Site from "discourse/models/site";

export default class Project extends RestModel {
  static async findAll() {
    try {
      const pre = await PreloadStore.getAndRemove("projects");
      const { projects = [] } = pre
        ? { projects: pre }
        : await ajax("/projects.json");
      // We must convert the project objects to categories in order to update the site
      // store for categories. This will allow to the category helpers and components to
      // display project correctly.
      const categories = projects.map((p) => Category.create(p));
      categories.forEach((cat) => Site.current().updateCategory(cat));
      return categories;
    } catch {
      return [];
    }
  }

  static async findList() {
    const projects = await Project.findAll();
    const list = CategoryList.create();
    projects.forEach((p) => list.pushObject(p));
    return list;
  }

  static async asyncSearch(filter = '') {
    const projects = await Project.findAll();
    const needle = filter.toLowerCase().trim();
    const match = ({ name, slug }) => {
      return !filter 
      || name.toLowerCase().includes(needle) 
      || slug.toLowerCase().includes(needle);
    };
    return projects.filter(match);
  }
}
