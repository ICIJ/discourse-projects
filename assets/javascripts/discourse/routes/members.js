import { inject as service } from "@ember/service";
import Category from "discourse/models/category";
import Group from "discourse/models/group";
import DiscourseRoute from "discourse/routes/discourse";
import I18n from "I18n";
import iteratee from "../helpers/iteratee";
import uniqueBy from "../helpers/unique-by";

export default class MembersRoute extends DiscourseRoute {
  @service router;
  @service store;

  async model({ slug }) {
    // Load the category by its slug.
    const category = Category.findSingleBySlug(slug);
    // Reload it from the backend to get its groups permissions
    const groupPermissions = await Category.reloadBySlugPath(slug).then(
      iteratee("category.group_permissions")
    );
    // Define an asynchronous function to load group members.
    const loadMembers = ({ group_name: name }) =>
      Group.loadMembers(name).then(iteratee("members"));
    // Use Promise.all to load members for all groups concurrently.
    const groupMembers = await Promise.all(groupPermissions.map(loadMembers));
    // Flatten the array of group members and remove duplicates.
    const members = uniqueBy(groupMembers.flat(), iteratee("id"));
    // Return the category and its unique members.
    return { category, members };
  }

  afterModel(model) {
    if (!model) {
      this.router.replaceWith("/404");
      return;
    }
  }

  titleToken() {
    const { category } = this.currentModel;
    const { name: projectName } = category;
    return I18n.t("members.title", { projectName });
  }
}
