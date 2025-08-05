import { service } from "@ember/service";
import { ajax } from "discourse/lib/ajax";
import { popupAjaxError } from "discourse/lib/ajax-error";
import { defaultHomepage } from "discourse/lib/utilities";
import Category from "discourse/models/category";
import CategoryList from "discourse/models/category-list";
import DiscourseRoute from "discourse/routes/discourse";
import { i18n } from "discourse-i18n";

export default class ProjectsRoute extends DiscourseRoute {
  @service router;

  async model() {
    try {
      const { projects: results } = await ajax("/projects.json");
      const projects = CategoryList.create();
      results.forEach((p) => projects.pushObject(Category.create(p)));
      return { projects };
    } catch (error) {
      popupAjaxError(error);
    }
  }

  setupController(controller, model) {
    controller.setProperties(model);
  }

  titleToken() {
    if (defaultHomepage() === "projects") {
      return;
    }
    return i18n("projects.title");
  }
}
