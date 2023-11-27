import { visit } from "@ember/test-helpers";
import { test } from "qunit";
import discoveryFixtures from "discourse/tests/fixtures/discovery-fixtures";
import { acceptance } from "discourse/tests/helpers/qunit-helpers";
import { cloneJSON } from "discourse-common/lib/object";

acceptance("Search avdanced options with a project filter", function (needs) {
  // Use Discourse's ficture for categories
  // @see https://github.com/discourse/discourse/blob/main/app/assets/javascripts/discourse/tests/fixtures/discovery-fixtures.js
  const fixture = discoveryFixtures["/categories.json"];
  const categories = fixture.category_list.categories.map((cat) => {
    // We ensure that only "blog" and "faq" are treated as project.
    // That also means the projects page will only show those 2 categories if
    // the filter by project works as expected.
    return { ...cat, is_project: ["blog", "faq"].includes(cat.slug) };
  });
  needs.site(cloneJSON({ categories }));
  needs.settings({ projects_enabled: true });

  test("Show a project filter", async function (assert) {
    await visit("/search");
    assert.dom("#search-in-project").exists("it shows the filter");
  });

  test("Show a project filter with the faq project selected", async function (assert) {
    await visit("/search?q=%23faq");
    assert.dom("#search-in-project .category-name").includesText("faq");
  });

  test("Show an empty project filter with the dev category selected", async function (assert) {
    await visit("/search?q=%23dev");
    assert.dom("#search-in-project .category-name").doesNotExist();
    assert.dom("#search-in-category .category-name").includesText("dev");
  });
});
