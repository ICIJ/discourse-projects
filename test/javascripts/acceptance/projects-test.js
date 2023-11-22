import { fillIn, visit } from "@ember/test-helpers";
import { test } from "qunit";
import discoveryFixtures from "discourse/tests/fixtures/discovery-fixtures";
import {
  acceptance,
  count,
  exists,
  queryAll,
} from "discourse/tests/helpers/qunit-helpers";
import { cloneJSON } from "discourse-common/lib/object";

acceptance("Projects", function (needs) {
  // Use Discourse's ficture for categories
  // @see https://github.com/discourse/discourse/blob/main/app/assets/javascripts/discourse/tests/fixtures/discovery-fixtures.js
  const fixture = discoveryFixtures["/categories.json"]
  const categories = fixture.category_list.categories.map((cat) => {
    // We ensure that only "blog" and "faq" are treated as project.
    // That also means the projects page will only show those 2 categories if
    // the filter by project works as expected.
    return { ...cat, is_project: ["blog", "faq"].includes(cat.slug) };
  });

  needs.site(cloneJSON({ categories }));
  needs.user();
  needs.settings({ projects_enabled: true });

  test("Projects page exists", async function (assert) {
    await visit("/projects");
    assert.ok(exists(".projects"), "it shows a projects page");
  });

  test("Projects page list 2 projects", async function (assert) {
    await visit("/projects");
    assert.ok(exists(".projects .category-list"), "it shows a projects list");
    assert.strictEqual(count(".projects .category-list tbody tr"), 2);
  });

  test("Projects page should filter projects by name", async function (assert) {
    await visit("/projects");
    await fillIn(".projects-header input[type=text]", "log");
    assert.strictEqual(count(".projects .category-list tbody tr"), 1);
  });

  test("Projects page list projects sorted by name by default", async function (assert) {
    await visit("/projects");
    const names = queryAll(".projects .category-list .category-name");
    assert.strictEqual(names[0].innerText, "blog");
    assert.strictEqual(names[1].innerText, "faq");
  });
});
