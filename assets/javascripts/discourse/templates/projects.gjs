import { htmlSafe } from "@ember/template";
import RouteTemplate from "ember-route-template";
import CategoriesOnly from "discourse/components/categories-only";
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
          @value={{this.searchTerm}}
        />
        {{#if this.showMatches}}
          <div class="projects-header-matches">
            {{#if this.searchTerm}}
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
          <CategoriesOnly @categories={{@controller.filteredProjects}} />
        </div>
      {{else}}
        <EmptyState class="projects-empty" @title={{i18n "js.projects.empty"}} />
      {{/if}}
    </div>
  </template>
);