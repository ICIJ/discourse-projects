import { ajax } from "discourse/lib/ajax";
import Site from "discourse/models/site";
import NewCategoryRoute from "discourse/routes/new-category";

export default class NewSubcategoryRoute extends NewCategoryRoute {
  async model(params) {
    const model = await super.model(...arguments);
    try {
      const { category_id: categoryId } = params;
      const { category } = await ajax(`/c/${categoryId}/show.json`);
      // This will update the form's model value for the parent category
      model.set("parent_category_id", category.id);
      // Make sure the parent category is up to date in the store
      Site.current().updateCategory(category);
    } catch {
      model.set("parent_category_id", null);
    }
    return model;
  }

  defaultGroupPermissions() {
    return [];
  }
}
