import { service } from "@ember/service";
import Category from "discourse/models/category";
import DiscourseRoute from "discourse/routes/discourse";

export default class ProjectsEditCategoryRoute extends DiscourseRoute {
  @service siteSettings;
  @service router;
  @service currentUser;
  @service site;

  async beforeModel(transition) {
    // When the custom form is disabled, step aside to core's flow.
    if (!this.siteSettings.projects_custom_category_form) {
      this.router.replaceWith(await this.coreEditUrl(transition));
      return;
    }
    // Staff keep core's full admin form; this one is a deliberate subset.
    if (this.currentUser?.staff) {
      this.router.replaceWith(await this.coreEditUrl(transition));
      return;
    }
    if (!this.currentUser) {
      this.router.replaceWith("/404");
    }
  }

  // Core's edit route is path-based, so we need the category's full slug
  // path. Reading it from Site's copy is not safe: categories-as-top-level.js
  // nulls parent_category_id on CategoryList copies, and core's
  // CategoryList.categoriesFrom pushes those through Site#updateCategory, so
  // after any visit to /categories the global record can carry no parent and
  // slugFor yields an unprefixed slug that core's route will not match.
  // Category.asyncFindById does not help here either — it short-circuits to
  // that same synchronous, possibly-mutated lookup unless lazy_load_categories
  // is on and the id is uncached. Re-fetch instead: /c/:id/show.json is
  // authoritative, and feeding it back through updateCategory repairs the
  // mutated record on the way past. Falls back to /404 when we cannot name it.
  async coreEditUrl(transition) {
    const id = parseInt(transition.to.params.category_id, 10);

    try {
      const { category } = await Category.reloadById(id);
      return `/c/${Category.slugFor(this.site.updateCategory(category))}/edit`;
    } catch {
      return "/404";
    }
  }

  // /c/:id/show.json is `can_see`-gated only, and returns the full
  // CategorySerializer — which is where can_edit, can_delete and
  // cannot_delete_reason come from. site.updateCategory turns the payload into
  // a real Category model (creating it if the site list has never seen it).
  async model(params) {
    const result = await Category.reloadById(parseInt(params.category_id, 10));
    return this.site.updateCategory(result.category);
  }

  afterModel(category) {
    if (!category?.can_edit) {
      this.router.replaceWith("/404");
    }
  }
}
