import { ajax } from "discourse/lib/ajax";
import { SEARCH_PRIORITIES } from "discourse/lib/constants";
import Site from "discourse/models/site"
import NewCategoryRoute from "discourse/routes/new-category";
import { addObserver } from '@ember/object/observers';


export default class NewSubcategoryRoute extends NewCategoryRoute {
  async model(params) {
    const model = await super.model(...arguments);
    try {
      const { category_id: categoryId } = params;
      const { category } = await ajax(`/c/${categoryId}/show.json`);
      // Make sure the parent category is up to date in the store
      Site.current().updateCategory(category);
      // This will update the form's model value for the parent category
      return this.store.createRecord("category", {
        color: "0088CC",
        text_color: "FFFFFF",
        style_type: "icon",
        icon: "square-full",
        group_permissions: category?.group_permissions ?? [],
        available_groups: this.site.groups.map((g) => g.name),
        parent_category_id: parseInt(categoryId, 10),
        allow_badges: true,
        topic_featured_link_allowed: true,
        custom_fields: {},
        category_setting: {},
        search_priority: SEARCH_PRIORITIES.normal,
        required_tag_groups: [],
        form_template_ids: [],
        minimum_required_tags: 0,
        category_localizations: [],
      });
    } catch {
      return model;
    }
  }

  groupPermissions() {
    return [];
  }
}
