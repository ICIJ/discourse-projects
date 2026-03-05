import { apiInitializer } from "discourse/lib/api";
import PreloadStore from "discourse/lib/preload-store";
import Category from "discourse/models/category";

const SUBCATEGORIES_ROUTE = "discovery.subcategories";

/**
 * When `projects_link_to_subcategories` is enabled, visiting a project
 * category's root URL (e.g. /c/aladdin/1435/) redirects to its
 * subcategories page (/c/aladdin/1435/subcategories).
 *
 * This overrides the `discovery.category` route's model hook to redirect
 * before any topic data is fetched.
 */
function initialize(api) {
  const siteSettings = api.container.lookup("service:site-settings");

  if (!siteSettings.projects_link_to_subcategories) {
    return;
  }

  api.modifyClass(
    "route:discovery.category",
    (Superclass) =>
      class extends Superclass {
        async findCategory(slugPath) {
          return this.site.lazy_load_categories
            ? await Category.asyncFindBySlugPathWithID(slugPath)
            : Category.findBySlugPathWithID(slugPath);
        }

        async model(params, transition) {
          const slugPath = params.category_slug_path_with_id;
          const category = await this.findCategory(slugPath);

          if (category?.is_project) {
            PreloadStore.getAndRemove("topic_list");
            this.router.replaceWith(SUBCATEGORIES_ROUTE, slugPath);
            return;
          }

          return super.model(params, transition);
        }
      }
  );
}

export default apiInitializer(initialize);
