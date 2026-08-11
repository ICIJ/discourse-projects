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

  // A second level below faqChild, so there is a two-deep trail to assert on.
  const faqGrandchild = {
    id: 501,
    name: "FAQ Grandchild",
    slug: "faq-grandchild",
    color: "5C8AC7",
    text_color: "FFFFFF",
    parent_category_id: 500,
    is_project: false,
    project: { id: 4, name: "faq", slug: "faq" },
  };

  // A second child of the faq project, so faqChild has a sibling to switch to.
  const faqSibling = {
    id: 502,
    name: "FAQ Sibling",
    slug: "faq-sibling",
    color: "9EB83B",
    text_color: "FFFFFF",
    parent_category_id: 4,
    is_project: false,
    project: { id: 4, name: "faq", slug: "faq" },
  };

  needs.site(
    cloneJSON({
      categories: [...categories, faqChild, faqGrandchild, faqSibling],
    })
  );
  needs.user();
  needs.settings({
    projects_enabled: true,
    projects_breadcrumb_project_dropdown: true,
    projects_breadcrumb_subcategory_links: true,
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

    server.get("/c/faq/faq-child/faq-grandchild/501/l/latest.json", () =>
      helper.response(cloneJSON(discoveryFixtures["/latest.json"]))
    );

    // faqSibling is also nested under faq (parent_category_id: 4), so it needs
    // the same literal route as faqChild above.
    server.get("/c/faq/faq-sibling/502/l/latest.json", () =>
      helper.response(cloneJSON(discoveryFixtures["/latest.json"]))
    );

    server.get("/c/:category-id/show.json", () =>
      helper.response(cloneJSON(categoryFixtures["/c/1/show.json"]))
    );

    // Exercised only by the lazy_load_categories test below: CategoryDrop.search()
    // fetches over the wire instead of reading `categories` directly when that
    // setting is on.
    server.post("/categories/search", (request) => {
      const { parent_category_id } = helper.parsePostData(request.requestBody);
      const siblings = [faqChild, faqGrandchild, faqSibling].filter(
        (cat) => cat.parent_category_id === Number(parent_category_id)
      );
      return helper.response({
        categories: siblings,
        categories_count: siblings.length,
        ancestors: [],
      });
    });
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
      .dom(
        "li.breadcrumb-chain__cell[data-category-id='4'] a.breadcrumb-chain__link"
      )
      .hasAttribute(
        "href",
        "/c/faq/4",
        "the link points at the project, not the subcategory"
      );

    await click(
      "li.breadcrumb-chain__cell[data-category-id='4'] a.breadcrumb-chain__link"
    );

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
    // Two cells, root and child, so this covers both carets, not just the root's.
    await visit("/c/faq/faq-child/500");

    assert
      .dom("li.breadcrumb-chain__cell .select-kit-selected-name")
      .doesNotExist(
        "no cell's dropdown header repeats the name shown by its link"
      );
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

  test("a subcategory gets its own cell linking to itself", async function (assert) {
    await visit("/c/faq/faq-child/500");

    assert.dom("li.breadcrumb-chain__cell").exists({ count: 2 });

    const links = [
      ...document.querySelectorAll("a.breadcrumb-chain__link"),
    ].map((a) => a.getAttribute("href"));
    assert.deepEqual(links, ["/c/faq/4", "/c/faq/faq-child/500"]);
  });

  test("a two-deep trail renders a cell per level, in order", async function (assert) {
    await visit("/c/faq/faq-child/faq-grandchild/501");

    assert.dom("li.breadcrumb-chain__cell").exists({ count: 3 });

    const links = [
      ...document.querySelectorAll("a.breadcrumb-chain__link"),
    ].map((a) => a.getAttribute("href"));
    assert.deepEqual(links, [
      "/c/faq/4",
      "/c/faq/faq-child/500",
      "/c/faq/faq-child/faq-grandchild/501",
    ]);
  });

  test("a child caret lists its siblings, not its children", async function (assert) {
    await visit("/c/faq/faq-child/500");

    const cell = "li.breadcrumb-chain__cell[data-category-id='500']";
    await selectKit(`${cell} .select-kit`).expand();

    // 502 is faqChild's sibling under the faq project; 501 is faqChild's own child.
    assert
      .dom(`${cell} .select-kit-row[data-value='502']`)
      .exists("the sibling is listed");
    assert
      .dom(`${cell} .select-kit-row[data-value='501']`)
      .doesNotExist("its own child is not listed");
  });

  test("a child caret drops the all-categories and no-categories shortcuts", async function (assert) {
    await visit("/c/faq/faq-child/500");

    const cell = "li.breadcrumb-chain__cell[data-category-id='500']";
    await selectKit(`${cell} .select-kit`).expand();

    assert
      .dom(`${cell} .select-kit-row[data-value='all-categories']`)
      .doesNotExist("the all-categories shortcut is not listed");
    assert
      .dom(`${cell} .select-kit-row[data-value='no-categories']`)
      .doesNotExist("the no-categories shortcut is not listed");
    assert
      .dom(`${cell} .select-kit-row[data-value='502']`)
      .exists("a real sibling is still listed");
  });

  test("a child caret drops the shortcuts when lazy_load_categories is on", async function (assert) {
    await visit("/c/faq/faq-child/500");

    // Flip after the visit, not via needs.site: CategoryDrop.search() reads this
    // live on every expand (select-kit.js's _open() always calls triggerSearch()),
    // so only the caret's own fetch-based path needs it, not the page's initial
    // load. Same technique core's own tests use (category-test.js, composer-test.js).
    this.owner.lookup("service:site").set("lazy_load_categories", true);

    const cell = "li.breadcrumb-chain__cell[data-category-id='500']";
    await selectKit(`${cell} .select-kit`).expand();

    assert
      .dom(`${cell} .select-kit-row[data-value='all-categories']`)
      .doesNotExist("the all-categories shortcut is not listed");
    assert
      .dom(`${cell} .select-kit-row[data-value='no-categories']`)
      .doesNotExist("the no-categories shortcut is not listed");
    assert
      .dom(`${cell} .select-kit-row[data-value='502']`)
      .exists("a real sibling is still listed");
  });

  test("selecting a sibling navigates to it", async function (assert) {
    await visit("/c/faq/faq-child/500");

    const picker = selectKit(
      "li.breadcrumb-chain__cell[data-category-id='500'] .select-kit"
    );
    await picker.expand();
    await picker.selectRowByValue(502);

    assert.strictEqual(currentURL(), "/c/faq/faq-sibling/502");
  });
});

acceptance("Breadcrumb chain with child cells off", function (needs) {
  const fixture = discoveryFixtures["/categories.json"];
  const categories = fixture.category_list.categories.map((cat) => {
    return {
      ...cat,
      is_project: ["blog", "faq"].includes(cat.slug),
      // The base fixture has no children for "faq". Core only renders its own
      // subcategory selector for the faqChild level below when the parent's
      // has_children flag is set (bread-crumbs.gjs's hasOptions getter), so
      // without this the assertion below has nothing to find regardless of
      // this plugin.
      has_children: cat.slug === "faq" ? true : cat.has_children,
    };
  });

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
    projects_breadcrumb_subcategory_links: false,
  });

  needs.pretender((server, helper) => {
    const projects = categories.filter((cat) => cat.is_project);
    server.get("/projects.json", () => helper.response({ projects }));
    server.get("/c/:category-slug/:category-id/l/latest.json", () =>
      helper.response(cloneJSON(discoveryFixtures["/latest.json"]))
    );
    server.get("/c/faq/faq-child/500/l/latest.json", () =>
      helper.response(cloneJSON(discoveryFixtures["/latest.json"]))
    );
    server.get("/c/:category-id/show.json", () =>
      helper.response(cloneJSON(categoryFixtures["/c/1/show.json"]))
    );
  });

  test("only the root cell is rendered and core's child dropdown remains", async function (assert) {
    await visit("/c/faq/faq-child/500");

    assert.dom("li.breadcrumb-chain__cell").exists({ count: 1 });
    assert
      .dom(".category-breadcrumb__subcategory-selector")
      .exists("core's own child dropdown is still in the DOM");
  });
});
