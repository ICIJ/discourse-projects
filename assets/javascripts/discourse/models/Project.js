import { ajax } from "discourse/lib/ajax";
import PreloadStore from "discourse/lib/preload-store";
import CategoryList from "discourse/models/category-list";
import RestModel from "discourse/models/rest";
import Site from "discourse/models/site";
import iteratee from "../helpers/iteratee";


export default class Project extends RestModel {
  static async findAll() {
    try {
      const pre = await PreloadStore.getAndRemove("projects");
      const projects = pre ?? await ajax("/projects.json").then(iteratee("projects"));

      return projects.map((p) => Site.current().updateCategory(p));
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
}
