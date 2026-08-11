import { computed } from "@ember/object";
import CategoryDrop, {
  ALL_CATEGORIES_ID,
  NO_CATEGORIES_ID,
} from "select-kit/components/category-drop";

/**
 * Drop the "all categories"/"no subcategories" shortcut rows that core's
 * categoriesWithShortcuts prepends (select-kit/components/category-drop.js).
 * A child breadcrumb caret only ever lists siblings, and the shortcut row
 * navigated to the parent category, which the previous chain cell's own
 * link already exposes, so nothing is lost by leaving them out here.
 *
 * Both `content` and `search` need filtering, not just `content`: when
 * site.lazy_load_categories is on, category-drop.js's search() fetches over
 * the wire and concats `shortcuts` again on every expand, bypassing `content`
 * entirely (category-drop.js:198-227). Don't drop the search() override
 * thinking it's redundant with content's.
 */
export default class SiblingDropdown extends CategoryDrop {
  _withoutShortcuts(categories) {
    return categories.filter(
      (category) =>
        category.id !== ALL_CATEGORIES_ID && category.id !== NO_CATEGORIES_ID
    );
  }

  @computed("categoriesWithShortcuts")
  get content() {
    return this._withoutShortcuts(this.categoriesWithShortcuts);
  }

  async search(filter) {
    return this._withoutShortcuts(await super.search(filter));
  }
}
