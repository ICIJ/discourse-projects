import { ajax } from "discourse/lib/ajax";
import { SEARCH_PRIORITIES } from "discourse/lib/constants";
import Site from "discourse/models/site";
import NewCategoryRoute from "discourse/routes/new-category";

export default class NewSubcategoryRoute extends NewCategoryRoute {
  async loadAndSetCategoryId(categoryId) {
    const id = parseInt(categoryId, 10);
    const { category } = await ajax(`/c/${categoryId}/show.json`);
    Site.current().updateCategory(category);
    // Register the category as loaded so that the CategoryChooser
    // doesn't try to async-load it again via notifyPropertyChange,
    // which conflicts with FormKit's read-only @transientData binding
    const ids = Site.current().loadedCategoryIds || new Set();
    // This will ensure that the category is available in the store
    ids.add(id);
    Site.current().set("loadedCategoryIds", ids);
    return { id, category };
  }

  async model(params) {
    const model = await super.model(...arguments);
    try {
      const { category_id: categoryId } = params;
      const { id: parentCategoryId, category } =
        await this.loadAndSetCategoryId(categoryId);
      return this.store.createRecord("category", {
        color: "0088CC",
        text_color: "FFFFFF",
        style_type: "icon",
        icon: "square-full",
        group_permissions: category?.group_permissions ?? [],
        available_groups: this.site.groups.map((g) => g.name),
        parent_category_id: parentCategoryId,
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
