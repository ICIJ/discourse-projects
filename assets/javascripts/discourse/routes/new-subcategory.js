import NewCategoryRoute from "discourse/routes/new-category";

export default class NewSubcategoryRoute extends NewCategoryRoute {
  async model(params) {
    const model = await super.model(...arguments);
    model.set("parent_category_id", this.getParentCategoryId(params));
    return model;
  }

  defaultGroupPermissions() {
    return [];
  }

  categoryExists(categoryId) {
    return this.site.categories.some(({ id }) => id === categoryId);
  }

  getParentCategoryId({ category_id: id }) {
    const parentCategoryId = parseInt(id, 10);
    return this.categoryExists(parentCategoryId) ? parentCategoryId : null;
  }
}
