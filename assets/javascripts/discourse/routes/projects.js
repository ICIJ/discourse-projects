import { service } from "@ember/service";
import { defaultHomepage } from "discourse/lib/utilities";
import CategoryList from "discourse/models/category-list";
import DiscourseRoute from "discourse/routes/discourse";
import { i18n } from "discourse-i18n";

export default class ProjectsRoute extends DiscourseRoute {
  @service store;

  model() {
    return CategoryList.list(this.store);
  }

  titleToken() {
    if (defaultHomepage() === "projects") {
      return;
    }
    return i18n("projects.title");
  }
}
