import NewCategory from "discourse/routes/new-category";
import { action, computed } from "@ember/object";


export default class NewSubcategory extends NewCategory { 

  async model(params) {
    const model = await super.model(...arguments);
    model.set('parent_category_id', this.getParentCategoryId(params));
    return model;
  }
  
  defaultGroupPermissions() {
    return [];
  }

  categoryExists(categoryId) {
    return this.site.categories.some(({ id }) => id === categoryId);
  }

  getParentCategoryId(params) {
    const parentCategoryId = parseInt(params.parent, 10);
    return this.categoryExists(parentCategoryId) ? parentCategoryId : null
  }
}
