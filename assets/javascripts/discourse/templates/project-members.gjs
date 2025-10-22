import RouteTemplate from "ember-route-template";
import ConditionalLoadingSpinner from "discourse/components/conditional-loading-spinner";
import DNavigation from "discourse/components/d-navigation";
import LoadMore from "discourse/components/load-more";
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
          @createCategory={{@controller.createCategory}}
          @createTopic={{@controller.createTopic}}
          @editCategory={{@controller.editCategory}}
          @hasDraft={{false}}
          @noSubcategories={{false}}
          @showCategoryAdmin={{false}}
          @skipCategoriesNavItem={{true}}
          @toggleInfo={{false}}

          @canCreateTopic={{@controller.canCreateTopic}}
        />
      </section>

      <div class="members-header">
        <SearchTextField
          @class="members-header-search"
          @aria-label={{i18n "js.members.filter"}}
          @value={{@controller.filterInput}}
        />

        {{#if @controller.showTotal}}
          <div class="members-header-matches">
            {{#if @controller.filterInput}}
              {{i18n "js.members.matches" count=@controller.members.length}}
            {{else}}
              {{i18n "js.members.total" count=@controller.membersTotal}}
            {{/if}}
          </div>
        {{/if}}
      </div>

      {{#if @controller.hasMembers}}
        <LoadMore @action={{@controller.loadMoreMembers}}>
          <ResponsiveTable @className="members-list group-members">
            <:header>
              <TableHeaderToggle
                @field="username"
                @labelKey="username"
                @onToggle={{@controller.updateOrder}}
                class="directory-table__column-header--username username"
                @order={{@controller.order}}
                @asc={{@controller.asc}}
                @automatic={{true}}
              />

              <div class="directory-table__column-header">
                <div class="header-contents">
                  {{i18n "groups.member_added"}}
                </div>
              </div>

              <div class="directory-table__column-header">
                <div class="header-contents">
                  {{i18n "last_post"}}
                </div>
              </div>

              <div class="directory-table__column-header">
                <div class="header-contents">
                  {{i18n "last_seen"}}
                </div>
              </div>
            </:header>
            <:body>
              {{#each @controller.members as |m|}}
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
                  <div
                    class="directory-table__cell member-list__cell--last-seen"
                  >
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
        </LoadMore>

        <ConditionalLoadingSpinner @condition={{@controller.loading}} />
      {{else if @controller.iddle}}
        <br />
        <div>{{i18n "js.members.empty"}}</div>
      {{/if}}
    </div>
  </template>
);
