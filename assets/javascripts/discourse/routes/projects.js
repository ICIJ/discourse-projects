import { inject as service } from "@ember/service";
import { defaultHomepage } from "discourse/lib/utilities";
import CategoryList from "discourse/models/category-list";
import DiscourseRoute from "discourse/routes/discourse";
import I18n from "I18n";

export default class ProjectsRoute extends DiscourseRoute {
  @service store;

  model() {
    return CategoryList.list(this.store);
  }

  titleToken() {
    if (defaultHomepage() === "projects") {
      return;
    }
    return I18n.t("projects.title");
  }
}
