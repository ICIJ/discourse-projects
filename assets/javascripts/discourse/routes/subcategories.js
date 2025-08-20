import { service } from "@ember/service";
import Category from "discourse/models/category";
import CategoryList from "discourse/models/category-list";
import DiscourseRoute from "discourse/routes/discourse";
import { i18n } from "discourse-i18n";

export default class SubcategoriesRoute extends DiscourseRoute {
  @service router;
  @service store;

  async model({ category_slug: slug }) {
    const category = Category.findSingleBySlug(slug);
    const { categories: subcategories } = await CategoryList.list(
      this.store,
      category
    );
    return { subcategories, category };
  }

  afterModel(model) {
    if (!model) {
      this.router.replaceWith("/404");
      return;
    }
  }

  titleToken() {
    const { category } = this.currentModel;
    const { name: categoryName } = category;
    // If the current category is within a project
    if (category.project) {
      // We use a different title
      // that display the project name
      const { name: projectName } = category.project;
      return i18n("subcategories.title_in_project", {
        categoryName,
        projectName,
      });
    }
    return i18n("subcategories.title", { categoryName });
  }
}
