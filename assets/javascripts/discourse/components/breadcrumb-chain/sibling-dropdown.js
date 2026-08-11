import CategoryDrop, {
  ALL_CATEGORIES_ID,
  NO_CATEGORIES_ID,
} from "select-kit/components/category-drop";

/**
 * Drop the "all categories"/"no subcategories" shortcut rows that core's
 * categoriesWithShortcuts prepends (select-kit/components/category-drop.js).
 * A child breadcrumb caret only ever lists siblings.
 *
 * The all-categories row's onChange routes to the parent category with no
 * filter (category-drop.js:250-273, getCategoryAndTagUrl(category, true,
 * tag)) — the same page the previous chain cell's own link already exposes,
 * so nothing is lost leaving that row out here. The no-categories row is not
 * equivalent: its onChange passes subcategories=false, which appends "/none"
 * to the parent's path (url.js:575-576), landing on the parent filtered to
 * its own topics only. No other control in the chain reaches that filtered
 * page, so dropping this row does lose it — accepted, not unnoticed.
 *
 * modifyContent is core's single choke point for the rendered rows: every
 * search — the lazy-loading fetch or the plain sync one — resolves through
 * _searchWrapper, which always runs the result through
 * `this.selectKit.modifyContent(content)` right before it becomes
 * mainCollection (select-kit.js:754, :788). Overriding modifyContent instead
 * of search() means a future change to search() cannot reintroduce the rows.
 */
export default class SiblingDropdown extends CategoryDrop {
  modifyContent(content) {
    return content.filter(
      (category) =>
        category.id !== ALL_CATEGORIES_ID && category.id !== NO_CATEGORIES_ID
    );
  }
}
