import categoryLink from "discourse/helpers/category-link";
import { apiInitializer } from "discourse/lib/api";
import { projectLinkHTML } from "../helpers/project-link";

const ItemCell = <template>
  <td class="category topic-list-data">
    {{#unless @topic.isPinnedUncategorized}}
      {{#if @topic.project}}
        {{projectLinkHTML @topic.project}}
      {{/if}}
      {{categoryLink @topic.category}}
    {{/unless}}
  </td>
</template>;

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

export default apiInitializer("0.8", initialize);