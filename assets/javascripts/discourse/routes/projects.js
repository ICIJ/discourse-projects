import { defaultHomepage } from "discourse/lib/utilities";
import DiscourseRoute from "discourse/routes/discourse";
import I18n from "I18n";

export default class ProjectsRoute extends DiscourseRoute {

  templateName = "projects";
  controllerName = "projects";

  titleToken() {
    if (defaultHomepage() === "projects") {
      return;
    }
    return I18n.t("projects.title");
  }
}
