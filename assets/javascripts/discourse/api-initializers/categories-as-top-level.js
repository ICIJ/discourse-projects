import { apiInitializer } from "discourse/lib/api";

/**
 * This initializer modifies the CategoryList model to include project subcategories
 * as top-level categories on the /categories page.
 * It does this by overriding the categoriesFrom method to include categories
 * that would normally be filtered out because they have parent_category_id set.
 */
function initialize(api) {
  const siteSettings = api.container.lookup("service:site-settings");

  if (!siteSettings.projects_hide_projects_from_categories_page) {
    return;
  }

  // Override CategoryList.categoriesFrom to include project subcategories
  api.modifyClass(
    "model:category-list",
    (Superclass) =>
      class extends Superclass {
        static categoriesFrom(store, result, parentCategory = null) {
          // For subcategory pages, use the default behavior
          if (parentCategory) {
            return super.categoriesFrom(store, result, parentCategory);
          }

          // On the main categories page, the backend already filters to show
          // project subcategories. We clear parent_category_id so they appear
          // as top-level, but keep the original for the project badge.
          const categories = result.category_list.categories.map((c) => {
            const _original_parent_category_id = c.parent_category_id;
            const parent_category_id = null;
            return { ...c, _original_parent_category_id, parent_category_id };
          });

          const category_list = { ...result.category_list, categories };
          const modifiedResult = { ...result, category_list };

          return super.categoriesFrom(store, modifiedResult, parentCategory);
        }
      }
  );

  // Use the parent-category-row-class transformer to add a class indicating
  // these are displayed as top-level even though they originally had a parent
  api.registerValueTransformer(
    "parent-category-row-class",
    ({ value, context }) => {
      const { currentRouteName } = api.container.lookup("service:router");
      const isRelevantRoute = currentRouteName === "discovery.categories";
      const hasOriginalParent = context?.category?._original_parent_category_id;

      if (isRelevantRoute && hasOriginalParent) {
        // Add a class to indicate this is a project subcategory shown as top-level
        return [...value, "project-subcategory-as-top-level"];
      }

      return value;
    }
  );
}

export default apiInitializer(initialize);
