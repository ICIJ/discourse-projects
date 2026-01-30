import { withPluginApi } from "discourse/lib/plugin-api";
import Category from "discourse/models/category";
import { customNavItemHref } from "discourse/models/nav-item";

/**
 * This initializer ensures that category discovery pages show the same
 * navigation items as the main discovery page (based on top_menu setting).
 *
 * By default, Discourse filters out the "categories" nav item when on a
 * category page. This initializer keeps it visible and makes it link to
 * the subcategories page of the current category.
 *
 * It also ensures that only items explicitly listed in top_menu are shown,
 * preventing extra items from appearing due to category default_view settings.
 */
function initialize(api) {
  const siteSettings = api.container.lookup("service:site-settings");

  if (!siteSettings.projects_sync_category_discovery_nav) {
    return;
  }

  const topMenuItems = new Set(siteSettings.top_menu.split("|"));

  // Override the href for "categories" nav item when on a category page
  // to point to the subcategories page instead of /categories
  customNavItemHref(function (navItem) {
    if (navItem.name === "categories" && navItem.category) {
      const slug = Category.slugFor(navItem.category);
      return `/c/${slug}/subcategories`;
    }
    return null; // Use default href
  });

  // Override NavItem.buildList to:
  // 1. Keep "categories" visible on category pages
  // 2. Only show items from top_menu setting
  api.modifyClass(
    "model:nav-item",
    (Superclass) =>
      class extends Superclass {
        static buildList(category, args) {
          // Get items from parent implementation
          let items = super.buildList(category, args);

          // Filter to only include items that are in top_menu
          // (This removes any items added due to category default_view
          // or other sources that aren't in the global top_menu setting)
          items = items.filter((item) => {
            // Keep items that are in top_menu, or are extra nav items
            // added by plugins (they have customFilter or customHref)
            if (item.customFilter || item.customHref) {
              return true;
            }
            return topMenuItems.has(item.name);
          });

          // If we're on a category page and "categories" is in top_menu,
          // we need to manually add it back since super.buildList() filters
          // it out when category is present
          if (category && topMenuItems.has("categories")) {
            // Check if categories item already exists
            const hasCategories = items.some(
              (item) => item.name === "categories"
            );
            if (!hasCategories) {
              // Create a new categories NavItem for this category
              const categoriesItem = Superclass.fromText("categories", {
                category,
              });
              // Insert at the position matching its order in top_menu
              const topMenuOrder = siteSettings.top_menu.split("|");
              const categoriesIndex = topMenuOrder.indexOf("categories");

              // Find the right position to insert
              let insertIndex = items.length;
              for (let i = 0; i < items.length; i++) {
                const itemIndex = topMenuOrder.indexOf(items[i].name);
                if (itemIndex > categoriesIndex) {
                  insertIndex = i;
                  break;
                }
              }
              items.splice(insertIndex, 0, categoriesItem);
            }
          }

          return items;
        }
      }
  );
}

export default {
  name: "sync-category-discovery-nav",
  initialize() {
    withPluginApi(initialize);
  },
};
