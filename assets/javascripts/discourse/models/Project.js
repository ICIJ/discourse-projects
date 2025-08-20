import { ajax } from "discourse/lib/ajax"
import Category from "discourse/models/category"
import CategoryList from "discourse/models/category-list"
import RestModel from "discourse/models/rest"

export default class Project extends RestModel {

  static async findAll() {
    const { projects = [] } = await ajax('/projects.json') ?? {}
    return projects.map((p) => Category.create(p))
  }

  static async findList() {
    const projects = await Project.findAll()
    const list = CategoryList.create()
    projects.forEach((p) => list.pushObject(p))
    return list
  }
}
