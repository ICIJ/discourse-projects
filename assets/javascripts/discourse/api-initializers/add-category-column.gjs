import { service } from "@ember/service";
import Component from "@glimmer/component";
import categoryLink from "discourse/helpers/category-link";
import { apiInitializer } from "discourse/lib/api";
import { projectLinkHTML } from "../helpers/project-link";

class ItemCell extends Component {
  @service router;
  @service siteSettings;

  get showLinks() {
    return (
      !this.args.topic.isPinnedUncategorized &&
      (this.showProject || this.showCategory)
    );
  }

  get showProject() {
    return (
      this.siteSettings.projects_addon
    ) && (
      this.router.currentRouteName === "discovery.latest" ||
      this.router.currentRouteName === "discovery.new" ||
      this.router.currentRouteName === "discovery.top" ||
      this.router.currentRouteName === "discovery.posted"
    ) && !!(
      this.args.topic.project
    );
  }

  get showCategory() {
    return this.args.topic.category?.id !== this.args.topic.project?.id;
  }

  <template>
    <td class="category topic-list-data">
      <div class="topic-category">
        {{#if this.showLinks}}
          {{#if this.showProject}}
            {{projectLinkHTML @topic.project}}
          {{/if}}
          {{#if this.showCategory}}
            {{categoryLink @topic.category}}
          {{/if}}
        {{/if}}
      </div>
    </td>
  </template>
}

/**
 * The role of this API initializer is to modify the category column in
 * the topic list which is created by a theme component.
 *
 * @see https://github.com/discourse/discourse-add-category-column
 */
function initialize(api) {
  api.registerValueTransformer("topic-list-columns", ({ value: columns }) => {
    const { add } = columns;
    // I could not find a way to run this initializer after the column "category" is
    // created by discourse/discourse-add-category-column so I am using a workaround
    // to override the add method and detect when the column is added. This could
    // easily be replace by a plugin outlet inside the column category
    // but they are currently none.
    columns.add = function (key, value, position) {
      if (key === "category") {
        const item = ItemCell;
        return add.call(columns, key, { ...value, item }, position);
      }
      return add.call(columns, key, value, position);
    };

    return columns;
  });
}

export default apiInitializer(initialize);
