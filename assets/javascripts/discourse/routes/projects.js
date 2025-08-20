import { service } from "@ember/service";
import { popupAjaxError } from "discourse/lib/ajax-error";
import { defaultHomepage } from "discourse/lib/utilities";
import DiscourseRoute from "discourse/routes/discourse";
import { i18n } from "discourse-i18n";
import Project from "../models/Project";

export default class ProjectsRoute extends DiscourseRoute {
  @service router;

  async model() {
    try {
      const projects = await Project.findList();
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
