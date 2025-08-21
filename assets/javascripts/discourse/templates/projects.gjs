import { on } from "@ember/modifier";
import { htmlSafe } from "@ember/template";
import RouteTemplate from "ember-route-template";
import CategoryTitleLink from "discourse/components/category-title-link";
import DToggleSwitch from "discourse/components/d-toggle-switch";
import EmptyState from "discourse/components/empty-state";
import SearchTextField from "discourse/components/search-text-field";
import SubCategoryItem from "discourse/components/sub-category-item";
import categoryColorVariable from "discourse/helpers/category-color-variable";
import dirSpan from "discourse/helpers/dir-span";
import { i18n } from "discourse-i18n";
import ComboBox from "select-kit/components/combo-box";

export default RouteTemplate(
  <template>
    <div class="projects">
      <div class="projects-header">
        <div class="projects-header-start">
          <SearchTextField
            @aria-label={{i18n "js.projects.filter"}}
            @value={{@controller.searchTerm}}
          />
          {{#if @controller.showMatches}}
            <div class="projects-header-matches">
              {{#if @controller.searchTerm}}
                {{i18n
                  "js.projects.matches"
                  count=@controller.filteredProjects.length
                }}
              {{else}}
                {{i18n
                  "js.projects.total"
                  count=@controller.filteredProjects.length
                }}
              {{/if}}
            </div>
          {{/if}}
        </div>
        <div class="projects-header-end">
          <DToggleSwitch
            @label="js.projects.showSubcategories"
            @state={{@controller.withSubcategories}}
            {{on "click" @controller.toggleWithSubcategories}}
          />
          <DToggleSwitch
            @label="js.projects.showDescription"
            @state={{@controller.withDescription}}
            {{on "click" @controller.toggleWithDescription}}
          />
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
      </div>
      {{#if @controller.hasProjects}}
        <div
          class="projects-list"
          style={{htmlSafe @controller.projectsListStyle}}
        >
          <table class="category-list">
            <thead>
              <tr>
                <th class="category">
                  <span
                    role="heading"
                    aria-level="2"
                    id="categories-only-category"
                  >
                    {{i18n "categories.category"}}
                  </span>
                </th>
                <th class="topics">{{i18n "categories.topics"}}</th>
              </tr>
            </thead>
            <tbody class="">
              {{#each @controller.filteredProjects as |c|}}
                <tr
                  data-category-id={{c.id}}
                  data-notification-level={{c.notificationLevelString}}
                  class="{{if
                      c.description_excerpt
                      'has-description'
                      'no-description'
                    }}
                    parent-category-row-class
                    {{if c.uploaded_logo.url 'has-logo' 'no-logo'}}"
                >
                  <td class="category" style={{categoryColorVariable c.color}}>
                    <CategoryTitleLink @category={{c}} />

                    {{#if @controller.withDescription}}
                      {{#if c.description_excerpt}}
                        <div class="category-description">
                          {{dirSpan c.description_excerpt htmlSafe="true"}}
                        </div>
                      {{/if}}
                    {{/if}}
                    {{#if @controller.withSubcategories}}
                      <div class="subcategories">
                        {{#each c.subcategories as |subcategory|}}
                          <SubCategoryItem @category={{subcategory}} />
                        {{/each}}
                      </div>
                    {{/if}}
                  </td>
                  <td class="topics">{{htmlSafe c.topics_all_time}}</td>
                </tr>
              {{/each}}
            </tbody>
          </table>
        </div>
      {{else}}
        <EmptyState
          class="projects-empty"
          @title={{i18n "js.projects.empty"}}
        />
      {{/if}}
    </div>
  </template>
);
