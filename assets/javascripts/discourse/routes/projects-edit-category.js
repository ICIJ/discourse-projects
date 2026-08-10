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

  // /c/<slug path>/edit, resolved via asyncFindById rather than findById: with
  // lazy_load_categories on, site.categories only holds sidebar categories
  // and their ancestors (core app/models/site.rb:106-133), so a plain
  // findById can miss an otherwise-valid id. asyncFindById also re-fetches a
  // category the site hasn't already loaded, rather than trusting whatever
  // copy is sitting in site.categories — which categories-as-top-level.js can
  // have mutated to a null parent_category_id (via CategoryList visiting
  // /categories), producing a wrong, unprefixed slug. Falls back to /404 when
  // we cannot name it.
  async coreEditUrl(transition) {
    const id = parseInt(transition.to.params.category_id, 10);
    const category = await Category.asyncFindById(id);
    return category ? `/c/${Category.slugFor(category)}/edit` : "/404";
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
