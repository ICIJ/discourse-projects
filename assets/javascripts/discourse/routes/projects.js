import CategoriesOnly from "discourse/components/categories-only";
import { defaultHomepage } from "discourse/lib/utilities";
import DiscourseRoute from "discourse/routes/discourse";

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
