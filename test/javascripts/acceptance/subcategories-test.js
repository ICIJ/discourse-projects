import { visit } from "@ember/test-helpers";
import { test } from "qunit";
import discoveryFixtures from "discourse/tests/fixtures/discovery-fixtures";
import { acceptance, exists } from "discourse/tests/helpers/qunit-helpers";
import { cloneJSON } from "discourse-common/lib/object";

acceptance("Subcategories", function (needs) {
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
  needs.user();
  needs.settings({ projects_enabled: true });

  test("Subcategories page exists", async function (assert) {
    await visit("/categories/13");
    assert.ok(exists(".subcategories"), "it shows a subcategories page");
  });
});
