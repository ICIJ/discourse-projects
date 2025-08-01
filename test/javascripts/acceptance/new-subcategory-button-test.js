import { getOwner } from "@ember/application";
import { click, visit } from "@ember/test-helpers";
import { test } from "qunit";
import { cloneJSON } from "discourse/lib/object";
import categoryFixtures from "discourse/tests/fixtures/category-fixtures";
import discoveryFixtures from "discourse/tests/fixtures/discovery-fixtures";
import { acceptance } from "discourse/tests/helpers/qunit-helpers";

acceptance("New subcategory button", function (needs) {
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
  needs.user({ can_create_category: true });
  needs.settings({ projects_enabled: true });

  needs.pretender((server, helper) => {
    server.get("/c/:category-slug/:category-id/l/latest.json", () => {
      return helper.response(cloneJSON(discoveryFixtures["/latest.json"]));
    });

    server.get("/c/:category-id/show.json", () => {
      return helper.response(cloneJSON(categoryFixtures["/c/1/show.json"]));
    });
  });

  test("Show the button on the homepage", async function (assert) {
    await visit("/");
    assert.dom("button.new-subcategory-button").exists("it shows the button");
  });

  test("Open a modal to select a project on the homepage", async function (assert) {
    await visit("/");
    await click("button.new-subcategory-button");
    assert.dom(".d-modal").exists("it shows a modal");
  });

  test("Show the button on the `faq` category page", async function (assert) {
    await visit("/c/faq");
    assert
      .dom("button.new-subcategory-button")
      .exists("it shows the button on the homepage");
  });

  test("Don't open a modal to select a project on the `faq` category page", async function (assert) {
    await visit("/c/faq");
    await click("button.new-subcategory-button");
    assert.dom(".d-modal").doesNotExist("it shows a modal");
    const router = getOwner(this).lookup("service:router");
    assert.strictEqual(
      router.currentRouteName,
      "newSubcategory",
      "is on new sub category route"
    );
  });
});
