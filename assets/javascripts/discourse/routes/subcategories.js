import { inject as service } from "@ember/service";
import Category from "discourse/models/category";
import DiscourseRoute from "discourse/routes/discourse";
import I18n from "I18n";

export default class SubcategoriesRoute extends DiscourseRoute {
  @service router;

  model(params) {
    return Category.list().findBy("id", parseInt(params.parent, 10));
  }

  afterModel(model) {
    if (!model) {
      this.router.replaceWith("/404");
      return;
    }
  }

  titleToken() {
    const { name: categoryName } = this.currentModel;
    return I18n.t("subcategories.title", { categoryName });
  }
}
