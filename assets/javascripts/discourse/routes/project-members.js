import { service } from "@ember/service";
import DiscourseRoute from "discourse/routes/discourse";
import { i18n } from "discourse-i18n";
import Project from "../models/Project";

export default class ProjectMembersRoute extends DiscourseRoute {
  @service router;

  async model({ category_slug: slug }) {
    return Project.create({ slug }).load();
  }

  setupController(controller, model) {
    controller.setProperties({ model });
    controller.reloadMembers();
  }

  afterModel(model) {
    if (!model) {
      this.router.replaceWith("/404");
      return;
    }
  }

  titleToken() {
    const { name: projectName } = this.currentModel;
    return i18n("members.title", { projectName });
  }
}
