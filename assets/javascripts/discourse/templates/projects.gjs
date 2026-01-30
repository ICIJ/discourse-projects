import { htmlSafe } from "@ember/template";
import RouteTemplate from "ember-route-template";
import CategoryLogo from "discourse/components/category-logo";
import CategoryTitleBefore from "discourse/components/category-title-before";
import EmptyState from "discourse/components/empty-state";
import SearchTextField from "discourse/components/search-text-field";
import categoryColorVariable from "discourse/helpers/category-color-variable";
import dIcon from "discourse/helpers/d-icon";
import dirSpan from "discourse/helpers/dir-span";
import { i18n } from "discourse-i18n";
import ComboBox from "select-kit/components/combo-box";
import { projectUrl } from "../helpers/project-link";

export default RouteTemplate(
  <template>
    <div class="projects">
      <div class="projects__header">
        <div class="projects__header__start">
          <SearchTextField
            @aria-label={{i18n "js.projects.filter"}}
            @value={{@controller.searchTerm}}
          />
          {{#if @controller.showMatches}}
            <div class="projects__header__matches">
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
        <div class="projects__header__end">
          <div class="projects__header__sort-by">
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
        <div class="projects__grid">
          {{#each @controller.filteredProjects as |c|}}
            <div
              data-category-id={{c.id}}
              data-notification-level={{c.notificationLevelString}}
              class="projects__grid__entry"
              style={{categoryColorVariable c.color}}
            >
              <a class="projects__grid__entry__logo" href={{projectUrl c}}>
                <CategoryLogo @category={{c}} />
              </a>
              <div class="projects__grid__entry__wrapper">
                <a class="projects__grid__entry__title" href={{projectUrl c}}>
                  <CategoryTitleBefore @category={{c}} />
                  <span class="projects__grid__entry__title__name">
                    {{dirSpan c.displayName}}
                  </span>
                </a>
                {{#if c.description}}
                  <div class="projects__grid__entry__description">
                    {{htmlSafe c.description}}
                  </div>
                {{/if}}
                <div class="projects__grid__entry__footer">
                  <div class="projects__grid__entry__footer__stats">
                    {{#if c.topics_all_time}}
                      <div
                        class="projects__grid__entry__footer__stats__entry projects__grid__entry__footer__stats__entry--topics"
                      >
                        {{dIcon "layer-group"}}
                        {{i18n
                          "js.projects.stats.topics"
                          count=c.topics_all_time
                        }}
                      </div>
                    {{/if}}
                  </div>
                </div>
              </div>
            </div>
          {{/each}}
        </div>
      {{else}}
        <EmptyState
          class="projects__empty"
          @title={{i18n "js.projects.empty"}}
        />
      {{/if}}
    </div>
  </template>
);
