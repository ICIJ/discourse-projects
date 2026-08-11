import { click, currentURL, visit } from "@ember/test-helpers";
import { test } from "qunit";
import { cloneJSON } from "discourse/lib/object";
import categoryFixtures from "discourse/tests/fixtures/category-fixtures";
import discoveryFixtures from "discourse/tests/fixtures/discovery-fixtures";
import { acceptance } from "discourse/tests/helpers/qunit-helpers";
import selectKit from "discourse/tests/helpers/select-kit-helper";
import { i18n } from "discourse-i18n";

acceptance("Breadcrumb chain", function (needs) {
  const fixture = discoveryFixtures["/categories.json"];
  const categories = fixture.category_list.categories.map((cat) => {
    // Only "blog" and "faq" are treated as projects.
    return { ...cat, is_project: ["blog", "faq"].includes(cat.slug) };
  });

  // discovery-fixtures has no subcategory under a project: its only subcategory
  // is "spec" under "feature", which is not a project here. Add one under the
  // faq project (id 4) so there is a page deep inside a project to navigate
  // back from. The `project` field is what the JS model reads (plugin.rb
  // serializes it onto basic_category).
  const faqChild = {
    id: 500,
    name: "FAQ Child",
    slug: "faq-child",
    color: "AB9364",
    text_color: "FFFFFF",
    parent_category_id: 4,
    is_project: false,
    project: { id: 4, name: "faq", slug: "faq" },
  };

  needs.site(cloneJSON({ categories: [...categories, faqChild] }));
  needs.user();
  needs.settings({
    projects_enabled: true,
    projects_breadcrumb_project_dropdown: true,
  });

  needs.pretender((server, helper) => {
    const projects = categories.filter((cat) => cat.is_project);

    server.get("/projects.json", () => helper.response({ projects }));

    server.get("/c/:category-slug/:category-id/l/latest.json", () =>
      helper.response(cloneJSON(discoveryFixtures["/latest.json"]))
    );

    // The two-segment route above does not match a nested slug path, so the
    // subcategory page needs its own literal route.
    server.get("/c/faq/faq-child/500/l/latest.json", () =>
      helper.response(cloneJSON(discoveryFixtures["/latest.json"]))
    );

    server.get("/c/:category-id/show.json", () =>
      helper.response(cloneJSON(categoryFixtures["/c/1/show.json"]))
    );
  });

  test("the project name is a link to the project page", async function (assert) {
    await visit("/c/faq/4");

    assert
      .dom("li.breadcrumb-chain__cell a.breadcrumb-chain__link")
      .exists("the project cell has a home link");
    assert
      .dom("li.breadcrumb-chain__cell a.breadcrumb-chain__link")
      .hasAttribute("href", "/c/faq/4");
  });

  test("the home link goes back to the project from a subcategory", async function (assert) {
    await visit("/c/faq/faq-child/500");

    assert
      .dom("li.breadcrumb-chain__cell a.breadcrumb-chain__link")
      .hasAttribute(
        "href",
        "/c/faq/4",
        "the link points at the project, not the subcategory"
      );

    await click("li.breadcrumb-chain__cell a.breadcrumb-chain__link");

    assert.strictEqual(currentURL(), "/c/faq/4");
  });

  test("the home link renders for the uncategorized category", async function (assert) {
    // id 17 / slug "uncategorized" comes from the /categories.json fixture
    // already loaded above; site.uncategorized_category_id defaults to 17 too
    // (tests/fixtures/site-fixtures.js), so this is Discourse's real
    // uncategorized category, not a stand-in.
    await visit("/c/uncategorized/17");

    assert
      .dom("li.breadcrumb-chain__cell a.breadcrumb-chain__link")
      .exists("the home link renders for the uncategorized category");
    assert
      .dom("li.breadcrumb-chain__cell a.breadcrumb-chain__link")
      .hasText(
        "uncategorized",
        "allowUncategorized keeps the category name instead of an empty anchor"
      );
  });

  test("the name is not repeated inside the dropdown", async function (assert) {
    await visit("/c/faq/4");

    assert
      .dom("li.breadcrumb-chain__cell .select-kit-selected-name")
      .doesNotExist("the dropdown header is reduced to its caret");
    assert
      .dom("li.breadcrumb-chain__cell .btn-clear")
      .doesNotExist("the clearable button is gone with the header label");
  });

  test("the caret still opens the project switcher", async function (assert) {
    await visit("/c/faq/4");

    const switcher = selectKit("li.breadcrumb-chain__cell .select-kit");
    await switcher.expand();

    assert.true(switcher.isExpanded(), "the caret opens the switcher");
    // 13 is the "blog" project. Asserting on the row rather than on a row count
    // keeps the test from breaking if select-kit adds a shortcut row.
    assert
      .dom("li.breadcrumb-chain__cell .select-kit-row[data-value='13']")
      .exists("the other project is listed");
  });

  // /latest rather than /categories: the breadcrumb renders on both
  // (d-navigation.gjs:288 renders BreadCrumbs unconditionally), but /categories
  // needs desktop_category_page_style pinned to load its model in tests, as
  // custom-new-category-form-test.js documents. /latest needs no such setup.
  test("without a project the dropdown keeps its label", async function (assert) {
    await visit("/latest");

    assert
      .dom("li.breadcrumb-chain__cell a.breadcrumb-chain__link")
      .doesNotExist("no home link when no project is selected");
    assert
      .dom("li.breadcrumb-chain__cell .select-kit-selected-name")
      .hasText(
        i18n("js.project_dropdown.label"),
        "the dropdown still shows its own label"
      );
  });
});
