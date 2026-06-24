import { tracked } from "@glimmer/tracking";
import Controller from "@ember/controller";

export default class ProjectsNewCategoryController extends Controller {
  // Tracked so the numeric getters (and the form's re-mount key) recompute when
  // the query params change during an in-app transition. As plain fields the
  // template bindings never invalidated, so the form kept its first selection.
  @tracked projectId = null;
  @tracked parentCategoryId = null;

  queryParams = ["projectId", "parentCategoryId"];

  get numericProjectId() {
    return this.projectId ? parseInt(this.projectId, 10) : null;
  }

  get numericParentCategoryId() {
    return this.parentCategoryId ? parseInt(this.parentCategoryId, 10) : null;
  }
}
