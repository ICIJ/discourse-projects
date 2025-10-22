import { service } from "@ember/service";
import Category from "discourse/models/category";
import DiscourseRoute from "discourse/routes/discourse";
import { i18n } from "discourse-i18n";
import Project from "../models/Project";

export default class ProjectMembersRoute extends DiscourseRoute {
  @service router;

  async model({ category_slug_path_with_id: slugPathWithID = null } = {}) {
    if (slugPathWithID) {
      const category = this.site.lazy_load_categories
        ? await Category.asyncFindBySlugPathWithID(slugPathWithID)
        : Category.findBySlugPathWithID(slugPathWithID);

      return category ? Project.create(category) : null;
    }

    return null;
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
    if (!this.currentModel) {
      return;
    }

    const { name: projectName } = this.currentModel;
    return i18n("members.title", { projectName });
  }
}
