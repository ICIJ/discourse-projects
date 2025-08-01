import { visit } from "@ember/test-helpers";
import { test } from "qunit";
import { cloneJSON } from "discourse/lib/object";
import categoryFixtures from "discourse/tests/fixtures/category-fixtures";
import discoveryFixtures from "discourse/tests/fixtures/discovery-fixtures";
import { acceptance } from "discourse/tests/helpers/qunit-helpers";

acceptance("Project banner", function (needs) {
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
  needs.settings({
    projects_enabled: true,
    projects_banner_enabled: true,
    projects_banner_sticky: true,
  });

  needs.pretender((server, helper) => {
    server.get("/c/:category-slug/:category-id/l/latest.json", () => {
      return helper.response(cloneJSON(discoveryFixtures["/latest.json"]));
    });

    server.get("/c/:category-id/show.json", () => {
      return helper.response(cloneJSON(categoryFixtures["/c/1/show.json"]));
    });
  });

  test("Show the banner on the blog category", async function (assert) {
    await visit("/c/blog/13");

    assert.dom(".project-banner__wrapper").exists("it shows a project banner");
    assert.dom(".project-banner__wrapper__link").hasText("blog");
    assert
      .dom(".project-banner__wrapper__link")
      .hasAttribute("href", "/c/blog/13");
  });

  test("Show the banner on the faq category", async function (assert) {
    await visit("/c/faq/4");

    assert.dom(".project-banner__wrapper").exists("it shows a project banner");
    assert.dom(".project-banner__wrapper__link").hasText("faq");
    assert
      .dom(".project-banner__wrapper__link")
      .hasAttribute("href", "/c/faq/4");
  });

  test("Doesn't show the banner on the dev category", async function (assert) {
    await visit("/c/dev/7");

    assert
      .dom(".project-banner__wrapper")
      .doesNotExist("it doesn't show a project banner");
  });

  test("Show a sticky banner", async function (assert) {
    await visit("/c/blog/13");

    assert.dom(".project-banner--sticky").exists("it shows a sticky banner");
  });
});
