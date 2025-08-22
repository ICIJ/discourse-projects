import { ajax } from "discourse/lib/ajax";
import PreloadStore from "discourse/lib/preload-store";
import Category from "discourse/models/category";
import CategoryList from "discourse/models/category-list";
import RestModel from "discourse/models/rest";

export default class Project extends RestModel {
  static async findAll() {
    try {
      const pre = await PreloadStore.getAndRemove("projects");
      const { projects = [] } = pre
        ? { projects: pre }
        : await ajax("/projects.json");
      return projects.map((p) => Category.create(p));
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
}
