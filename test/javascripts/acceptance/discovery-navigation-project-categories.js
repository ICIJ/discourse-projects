import { visit } from "@ember/test-helpers";
import { test } from "qunit";
import { cloneJSON } from "discourse/lib/object";
import categoryFixtures from "discourse/tests/fixtures/category-fixtures";
import discoveryFixtures from "discourse/tests/fixtures/discovery-fixtures";
import { acceptance } from "discourse/tests/helpers/qunit-helpers";

acceptance("Project categories link in top menu", function (needs) {
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
  });

  test("Don't show the link on the homepage", async function (assert) {
    await visit("/");
    assert
      .dom("li.link-to-project-categories")
      .doesNotExist("it doesn't show the link");
  });

  test("Show the link the `faq` category page", async function (assert) {
    await visit("/c/faq");
    assert.dom("li.link-to-project-categories").exist("it shows the link");
  });
});
