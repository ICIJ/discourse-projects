import { service } from "@ember/service";
import DiscourseRoute from "discourse/routes/discourse";

export default class ProjectsNewCategoryRoute extends DiscourseRoute {
  @service siteSettings;
  @service router;
  @service currentUser;

  beforeModel() {
    // When the custom form is disabled, step aside to core's flow.
    if (!this.siteSettings.projects_custom_category_form) {
      this.router.replaceWith("newCategory");
      return;
    }
    // Re-implement core's guard (we no longer pass through route:new-category).
    if (!this.currentUser?.can_create_category) {
      this.router.replaceWith("/404");
    }
  }
}
