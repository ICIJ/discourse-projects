import RouteTemplate from "ember-route-template";
import CategoriesOnly from "discourse/components/categories-only";
import DNavigation from "discourse/components/d-navigation";
import EmptyState from "discourse/components/empty-state";
import { i18n } from "discourse-i18n";

export default RouteTemplate(
  <template>
    <div class="subcategories">
      <section class="navigation-container">
        <DNavigation
          @category={{@controller.category}}
          @showCategoryAdmin={{false}}
          @createTopic={{false}}
          @noSubcategories={{false}}
          @toggleInfo={{false}}
          @editCategory={{@controller.editCategory}}
          @createCategory={{@controller.createCategory}}
          @hasDraft={{false}}
          @skipCategoriesNavItem={{true}}
        />
      </section>

      {{#if @controller.hasSubcategories}}
        <CategoriesOnly
          class="subcategories-list"
          @categories={{@controller.subcategories}}
        />
      {{else}}
        <EmptyState
          class="subcategories-empty"
          @title={{i18n "js.projects.subcategories.empty"}}
        />
      {{/if}}
    </div>
  </template>
);
