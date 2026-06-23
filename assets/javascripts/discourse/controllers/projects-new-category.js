import Controller from "@ember/controller";
import { action } from "@ember/object";
import getURL from "discourse/lib/get-url";
import DiscourseURL from "discourse/lib/url";

export default class ProjectsNewCategoryController extends Controller {
  queryParams = ["parentCategoryId"];
  parentCategoryId = null;

  get numericParentCategoryId() {
    return this.parentCategoryId ? parseInt(this.parentCategoryId, 10) : null;
  }

  @action
  onCreated(category) {
    DiscourseURL.routeTo(getURL(`/c/${category.slug}/${category.id}`));
  }
}
