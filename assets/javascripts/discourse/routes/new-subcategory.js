import NewCategoryRoute from "discourse/routes/new-category";
import matches from "../helpers/matches";

export default class NewSubcategoryRoute extends NewCategoryRoute {
  async model(params) {
    const model = await super.model(...arguments);
    model.set("parent_category_id", this.getParentCategoryId(params));
    return model;
  }

  defaultGroupPermissions() {
    return [];
  }

  categoryExists(id) {
    return this.site.categories.some(matches({ id }));
  }

  getParentCategoryId({ category_id: id }) {
    const parentCategoryId = parseInt(id, 10);
    return this.categoryExists(parentCategoryId) ? parentCategoryId : null;
  }
}
