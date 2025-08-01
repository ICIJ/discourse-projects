import RouteTemplate from "ember-route-template";
import DNavigation from "discourse/components/d-navigation";
import EmptyState from "discourse/components/empty-state";
import ResponsiveTable from "discourse/components/responsive-table";
import SearchTextField from "discourse/components/search-text-field";
import TableHeaderToggle from "discourse/components/table-header-toggle";
import UserInfo from "discourse/components/user-info";
import boundDate from "discourse/helpers/bound-date";
import { i18n } from "discourse-i18n";

export default RouteTemplate(
  <template>
    <div class="members">
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

      <div class="members-header">
        <SearchTextField
          @class="members-header-search"
          @placeholder={{i18n "js.members.filter"}}
          @value={{@controller.searchTerm}}
        />

        {{#if @controller.showMatches}}
          <div class="members-header-matches">
            {{#if @controller.searchTerm}}
              {{i18n
                "js.members.matches"
                count=@controller.filteredMembersCount
              }}
            {{else}}
              {{i18n "js.members.total" count=@controller.filteredMembersCount}}
            {{/if}}
          </div>
        {{/if}}
      </div>

      {{#if @controller.hasFilteredMembers}}
        <ResponsiveTable @className="members-list group-members">
          <:header>
            <TableHeaderToggle
              @field="username"
              @labelKey="username"
              @class="directory-table__column-header--username username"
              @order={{@controller.order}}
              @asc={{@controller.asc}}
              @automatic={{true}}
            />

            <TableHeaderToggle
              @class="directory-table__column-header--added"
              @order={{@controller.order}}
              @asc={{@controller.asc}}
              @field="added_at"
              @labelKey="groups.member_added"
              @automatic={{true}}
            />

            <TableHeaderToggle
              @class="directory-table__column-header--last-posted"
              @order={{@controller.order}}
              @asc={{@controller.asc}}
              @field="last_posted_at"
              @labelKey="last_post"
              @automatic={{true}}
            />

            <TableHeaderToggle
              @class="directory-table__column-header--last-seen"
              @order={{@controller.order}}
              @asc={{@controller.asc}}
              @field="last_seen_at"
              @labelKey="last_seen"
              @automatic={{true}}
            />
          </:header>
          <:body>
            {{#each @controller.filteredMembers as |m|}}
              <div class="directory-table__row">
                <div
                  class="directory-table__cell member-list__cell--username group-member"
                  colspan="2"
                >
                  <UserInfo
                    @user={{m}}
                    @showStatus={{true}}
                    @showStatusTooltip={{true}}
                  />
                </div>
                <div class="directory-table__cell member-list__cell--added">
                  <span class="directory-table__label">
                    <span>{{i18n "groups.member_added"}}</span>
                  </span>
                  <span class="directory-table__value">
                    {{boundDate m.added_at}}
                  </span>
                </div>
                <div
                  class="directory-table__cell member-list__cell--last-posted"
                >
                  {{#if m.last_posted_at}}
                    <span class="directory-table__label">
                      <span>{{i18n "last_post"}}</span>
                    </span>
                  {{/if}}
                  <span class="directory-table__value">
                    {{boundDate m.last_posted_at}}
                  </span>
                </div>
                <div class="directory-table__cell member-list__cell--last-seen">
                  {{#if m.last_seen_at}}
                    <span class="directory-table__label">
                      <span>{{i18n "last_seen"}}</span>
                    </span>
                  {{/if}}
                  <span class="directory-table__value">
                    {{boundDate m.last_seen_at}}
                  </span>
                </div>
              </div>
            {{/each}}
          </:body>
        </ResponsiveTable>
      {{else}}
        <EmptyState class="members-empty" @title={{i18n "js.members.empty"}} />
      {{/if}}
    </div>
  </template>
);
