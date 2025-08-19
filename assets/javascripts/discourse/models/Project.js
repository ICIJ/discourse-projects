import { service } from "@ember/service";
import Category from "discourse/models/category";
import RestModel from "discourse/models/rest";

export default class Project extends RestModel {
  static async findAll() {
    return this.project.all.map((p) => Category.create(p));
  }

  @service project;
}
