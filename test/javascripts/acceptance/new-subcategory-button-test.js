import { getOwner } from "@ember/owner";
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
    const projects = categories.filter((cat) => cat.is_project);

    server.get("/projects.json", () => {
      return helper.response({ projects });
    });

    server.get("/c/:category-slug/:category-id/l/latest.json", () => {
      return helper.response(cloneJSON(discoveryFixtures["/latest.json"]));
    });

    server.get("/c/:category-id/show.json", () => {
      return helper.response(cloneJSON(categoryFixtures["/c/1/show.json"]));
    });

    server.get("/categories/types", () => {
      return helper.response({
        types: [
          { id: "general", name: "General", configuration_schema: {} },
          { id: "other", name: "Other", configuration_schema: {} },
        ],
        counts: { general: 0, other: 0 },
      });
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

  test("Routes into the core newCategory flow with the parent injected", async function (assert) {
    await visit("/c/faq");
    await click("button.new-subcategory-button");
    assert.dom(".d-modal").doesNotExist("it does not show a modal");

    const owner = getOwner(this);
    const router = owner.lookup("service:router");
    assert.true(
      router.currentRouteName.startsWith("newCategory"),
      "is in the core newCategory flow"
    );

    const faq = owner.lookup("service:site").categories.findBy("slug", "faq");
    const model = owner.lookup("route:new-category").currentModel;
    assert.strictEqual(
      model.parent_category_id,
      faq.id,
      "the new category has the faq category as parent"
    );
  });
});
