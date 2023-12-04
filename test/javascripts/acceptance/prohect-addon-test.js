import { visit } from "@ember/test-helpers";
import { test } from "qunit";
import categoryFixtures from "discourse/tests/fixtures/category-fixtures";
import discoveryFixtures from "discourse/tests/fixtures/discovery-fixtures";
import { acceptance } from "discourse/tests/helpers/qunit-helpers";
import { cloneJSON } from "discourse-common/lib/object";

acceptance("Project addon", function (needs) {
  // Use Discourse's ficture for categories
  // @see https://github.com/discourse/discourse/blob/main/app/assets/javascripts/discourse/tests/fixtures/discovery-fixtures.js
  const fixture = discoveryFixtures["/categories.json"];
  const categories = fixture.category_list.categories.map((cat) => {
    // We ensure that only "blog" and "faq" are treated as project.
    // That also means the projects page will only show those 2 categories if
    // the filter by project works as expected.
    return { ...cat, is_project: ["feature"].includes(cat.slug) };
  });

  needs.site(cloneJSON({ categories }));
  needs.user({ can_create_category: true });
  needs.settings({
    projects_enabled: true,
    projects_addon: true,
  });

  needs.pretender((server, helper) => {
    server.get("/c/:category-slug/:category-id/l/latest.json", () => {
      return helper.response(cloneJSON(discoveryFixtures["/latest.json"]));
    });

    server.get("/c/:category-id/show.json", () => {
      return helper.response(cloneJSON(categoryFixtures["/c/1/show.json"]));
    });
  });

  test("Show the project addon on topic list", async function (assert) {
    await visit("/");
    assert.dom(".project-link").exists("it shows a project link");
    assert.dom(".project-link").hasAttribute("href", "/c/feature/2");
  });
});
