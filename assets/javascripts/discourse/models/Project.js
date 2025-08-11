import { ajax } from "discourse/lib/ajax";
import Category from "discourse/models/category";
import RestModel from "discourse/models/rest";
import { service } from "@ember/service";

export default class Project extends RestModel {
  @service project;
  static async findAll() {
    return project.all.map((p) => Category.create(p));
  }
}