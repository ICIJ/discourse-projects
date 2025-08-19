import { click, fillIn, visit } from "@ember/test-helpers";
import { test } from "qunit";
import { cloneJSON } from "discourse/lib/object";
import discoveryFixtures from "discourse/tests/fixtures/discovery-fixtures";
import { acceptance, query } from "discourse/tests/helpers/qunit-helpers";
import selectKit from "discourse/tests/helpers/select-kit-helper";

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
  const blogCategory = categories.find((c) => c.name === "blog");
  const supportCategory = categories.find((c) => c.name === "support");
  // Make the support category a children of the blog category
  supportCategory.project = blogCategory;
  supportCategory.parent_category_id = blogCategory.id
  // Extract the list of projects from the categories
  const projects = categories.filter((cat) => cat.is_project)
  // Mock the projects API endpoint
  needs.pretender((server, helper) => {
    server.get("/projects.json", () =>
      helper.response({ projects })
    )
  })

  needs.site(cloneJSON({ categories }));
  needs.settings({ projects_enabled: true });

  test("Show a project filter", async function (assert) {
    await visit("/search");
    assert.dom("#search-in-project").exists("it shows the filter");
  });

  test("Show a filter with the faq project selected", async function (assert) {
    await visit("/search");
    await click(".advanced-filters > summary");
    await fillIn(".search-query", "none");
    const projectChooser = selectKit("#search-in-project");
    await projectChooser.expand();
    await projectChooser.fillInFilter("faq");
    await projectChooser.selectRowByValue(4);

    assert.strictEqual(
      query(".search-query").value,
      "none #faq",
      'has updated search term to "none #faq"'
    );
  });

  test("Show a filter with the dev category selected", async function (assert) {
    await visit("/search");
    await click(".advanced-filters > summary");
    await fillIn(".search-query", "none");
    const categoryChooser = selectKit("#search-in-category");

    await categoryChooser.expand();
    await categoryChooser.fillInFilter("dev");
    await categoryChooser.selectRowByValue(7);

    assert.strictEqual(
      query(".search-query").value,
      "none #dev",
      'has updated search term to "none #dev"'
    );
  });

  test("Show a filter with the dev category selected then back to blog", async function (assert) {
    await visit("/search");
    await click(".advanced-filters > summary");
    await fillIn(".search-query", "none");
    const categoryChooser = selectKit("#search-in-category");
    const projectChooser = selectKit("#search-in-project");

    await categoryChooser.expand();
    await categoryChooser.fillInFilter("dev");
    await categoryChooser.selectRowByValue(7);

    assert.strictEqual(
      query(".search-query").value,
      "none #dev",
      'has updated search term to "none #dev"'
    );

    await projectChooser.expand();
    await projectChooser.fillInFilter("blog");
    await projectChooser.selectRowByValue(13);

    assert.strictEqual(
      query(".search-query").value,
      "none #blog",
      'has updated search term to "none #blog"'
    );
  });

  test("Show a filter with the support category selected", async function (assert) {
    await visit("/search");
    await click(".advanced-filters > summary");
    await fillIn(".search-query", "none");
    const categoryChooser = selectKit("#search-in-category");
    const projectChooser = selectKit("#search-in-project");

    await categoryChooser.expand();
    await categoryChooser.fillInFilter("support");
    await categoryChooser.selectRowByValue(6);

    assert.strictEqual(
      query(".search-query").value,
      "none #blog:support",
      'has updated search term to "none #blog:support"'
    );

    assert.strictEqual(
      projectChooser.header().value(),
      "13",
      "has updated project filter to 13"
    );

    assert.strictEqual(
      categoryChooser.header().value(),
      "6",
      "has updated category filter to 6"
    );
  });
});
