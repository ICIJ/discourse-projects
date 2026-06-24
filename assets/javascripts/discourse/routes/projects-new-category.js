import { service } from "@ember/service";
import Category from "discourse/models/category";
import DiscourseRoute from "discourse/routes/discourse";

export default class ProjectsNewCategoryRoute extends DiscourseRoute {
  @service siteSettings;
  @service router;
  @service currentUser;

  // refreshModel so the preselected categories are (re)loaded on every in-app
  // query-param change, not just the first visit.
  queryParams = {
    projectId: { refreshModel: true },
    parentCategoryId: { refreshModel: true },
  };

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

  // When lazy_load_categories is on, the category choosers expect a preselected
  // value to already be in the async-loaded cache; otherwise they log a warning
  // and run a reload path that errors. Load them up front so preselection is
  // clean.
  async model(params) {
    const ids = [params.projectId, params.parentCategoryId]
      .map((value) => parseInt(value, 10))
      .filter((id) => !isNaN(id));

    if (ids.length) {
      await Category.asyncFindByIds(ids);
    }
  }
}
