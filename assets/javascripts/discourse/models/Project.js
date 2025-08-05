import { ajax } from "discourse/lib/ajax";
import Category from "discourse/models/category";
import RestModel from "discourse/models/rest";

export default class Project extends RestModel {
  static async findAll() {
    const { projects = [] } = await ajax('/projects.json') ?? {};
    return projects.map((p) => Category.create(p));
  }

}