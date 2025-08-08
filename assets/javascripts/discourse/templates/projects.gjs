import { htmlSafe } from "@ember/template";
import RouteTemplate from "ember-route-template";
import CategoriesOnly from "discourse/components/categories-only";
import ParentCategoryRow from "discourse/components/parent-category-row";
import SubCategoryRow from "discourse/components/sub-category-row";
import borderColor from "discourse/helpers/border-color";
import categoryColorVariable from "discourse/helpers/category-color-variable";
import SubCategoryItem from "discourse/components/sub-category-item";
import CategoryTitleLink from "discourse/components/category-title-link";
import EmptyState from "discourse/components/empty-state";
import SearchTextField from "discourse/components/search-text-field";
import { i18n } from "discourse-i18n";
import ComboBox from "select-kit/components/combo-box";

export default RouteTemplate(
  <template>
    <div class="projects">
      <div class="projects-header">
        <SearchTextField
          @aria-label={{i18n "js.projects.filter"}}
          @value={{@controller.searchTerm}}
        />
        {{#if @controller.showMatches}}
          <div class="projects-header-matches">
            {{#if @controller.searchTerm}}
              {{i18n "js.projects.matches" count=@controller.filteredProjects.length}}
            {{else}}
              {{i18n "js.projects.total" count=@controller.filteredProjects.length}}
            {{/if}}
          </div>
        {{/if}}
        <div class="projects-header-sort-by">
          {{i18n "js.projects.sortBy"}}&nbsp;
          <ComboBox
            @value={{@controller.sortBy}}
            @content={{@controller.sortByOptions}}
            @nameProperty="name"
            @valueProperty="value"
          />
        </div>
      </div>
      {{#if @controller.hasProjects}}
        <div class="projects-list" style={{htmlSafe @controller.projectsListStyle}}>
        <table class="category-list">
                    <thead>
                        <tr>
                          <th class="category"><span
                              role="heading"
                              aria-level="2"
                              id="categories-only-category"
                            >{{i18n "categories.category"}}</span></th>
                          <th class="topics">{{i18n "categories.topics"}}</th>
                        </tr>
                    </thead>
                 <tbody class="">
                {{#each @controller.filteredProjects as |c|}}
                        <tr
                          data-category-id={{c.id}}
                          data-notification-level={{c.notificationLevelString}}
                          class="{{if c.description_excerpt 'has-description' 'no-description' }}
                            {{ 'parent-category-row-class' }}
                            {{if c.uploaded_logo.url 'has-logo' 'no-logo'}}"
                        >
                            <td
                                class="category"
                                style={{categoryColorVariable c.color}}
                              >
                                <CategoryTitleLink @category={{c}}/>
                                 <div class="subcategories">
                                {{#each c.subcategories as |subcategory|}}
                                    <SubCategoryItem
                                    @category={{subcategory}}
                                    />
                                {{/each}}
                                </div>
                            </td>
                        </tr>
            {{/each}}
            </tbody>
            </table>
        </div>
      {{else}}
        <EmptyState class="projects-empty" @title={{i18n "js.projects.empty"}} />
      {{/if}}
    </div>
  </template>
);