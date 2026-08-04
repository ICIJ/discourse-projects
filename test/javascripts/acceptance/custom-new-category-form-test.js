import { getOwner } from "@ember/owner";
import { click, currentURL, fillIn, visit } from "@ember/test-helpers";
import { test } from "qunit";
import { cloneJSON } from "discourse/lib/object";
import discoveryFixtures from "discourse/tests/fixtures/discovery-fixtures";
import { acceptance } from "discourse/tests/helpers/qunit-helpers";

acceptance("Custom new category form", function (needs) {
  const fixture = discoveryFixtures["/categories.json"];
  const categories = fixture.category_list.categories.map((cat) => {
    return { ...cat, is_project: ["blog", "faq"].includes(cat.slug) };
  });

  // discovery-fixtures has no subcategory under a project: its only
  // subcategory is "spec" under "feature", which is not a project here. Add one
  // under the faq project (id 4). The `project` field is what the JS model
  // reads (plugin.rb serializes it onto basic_category), and the form resolves
  // a parent's project through it.
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

  let posted = null;

  needs.site(cloneJSON({ categories: [...categories, faqChild] }));
  needs.user({ can_create_category: true });
  needs.settings({
    projects_enabled: true,
    projects_custom_category_form: true,
  });

  needs.pretender((server, helper) => {
    posted = null;
    const projects = categories.filter((cat) => cat.is_project);
    server.get("/projects.json", () => helper.response({ projects }));
    server.get("/c/:id/show.json", () =>
      helper.response({
        category: {
          id: 2,
          group_permissions: [{ group_name: "everyone", permission_type: 1 }],
        },
      })
    );
    server.post("/categories", (request) => {
      posted = JSON.parse(request.requestBody);
      return helper.response({ category: { id: 99, slug: "new-cat" } });
    });
    // Cancel lands on a real category page, which needs a topic list. Any
    // well-formed list will do; reuse the one fixture that exists.
    const topicList = () =>
      helper.response(cloneJSON(discoveryFixtures["/c/bug/1/l/latest.json"]));
    server.get("/c/faq/4/l/latest.json", topicList);
    server.get("/c/faq/faq-child/500/l/latest.json", topicList);
  });

  test("redirects /new-category to the custom form (no type chooser, no modal)", async function (assert) {
    await visit("/new-category");
    assert.strictEqual(
      currentURL(),
      "/categories/new",
      "redirected to the form"
    );
    assert.dom(".d-modal").doesNotExist("no project-picker modal");
    assert.dom(".projects-new-category").exists("renders the plugin page");
    assert
      .dom(".form-kit__field[data-name='projectId']")
      .exists("project field");
    assert.dom(".form-kit__field[data-name='name']").exists("title field");
  });

  test("submitting creates the category with inherited parent permissions", async function (assert) {
    // projectId 4 is the "faq" project in the fixtures (is_project); a non-project
    // id would be dropped by the form's seed validation and block submission.
    await visit("/categories/new?projectId=4");
    await fillIn(".form-kit__field[data-name='name'] input", "My Category");
    await click(".form-kit__button[type='submit']");

    assert.strictEqual(posted.parent_category_id, 4, "parent from query param");
    assert.strictEqual(posted.name, "My Category", "title sent");
    assert.deepEqual(
      posted.permissions,
      { everyone: 1 },
      "inherited permissions"
    );
    assert.strictEqual(posted.color, "0088CC", "default colour sent");
  });

  test("the redirect also catches the setup sub-route", async function (assert) {
    await visit("/new-category/setup");
    assert.strictEqual(currentURL(), "/categories/new");
  });

  test("the core New category button never routes through newCategory", async function (assert) {
    await visit("/categories");

    // Non-staff never load the admin bundle, so the admin newCategory routes
    // are not registered and transitionTo asserts. The test env always loads
    // the admin bundle, so simulate the missing route.
    const router = getOwner(this).lookup("service:router");
    const transitionTo = router.transitionTo.bind(router);
    router.transitionTo = (name, ...rest) => {
      if (typeof name === "string" && name.startsWith("newCategory")) {
        throw new Error(`Assertion Failed: The route ${name} was not found`);
      }
      return transitionTo(name, ...rest);
    };

    await click("#create-category");

    assert.strictEqual(currentURL(), "/categories/new", "goes to the form");
  });

  test("cancel returns to the in-project parent category", async function (assert) {
    await visit("/categories/new?projectId=4&parentCategoryId=500");
    await click(".category-form__cancel");

    assert.strictEqual(
      currentURL(),
      "/c/faq/faq-child/500",
      "back to the parent category the form was opened from"
    );
  });

  test("cancel returns to the project when only a project is preselected", async function (assert) {
    await visit("/categories/new?projectId=4");
    await click(".category-form__cancel");

    assert.strictEqual(currentURL(), "/c/faq/4", "back to the project");
  });

  test("cancel returns to the projects index with no preselection", async function (assert) {
    await visit("/categories/new");
    await click(".category-form__cancel");

    assert.strictEqual(currentURL(), "/projects", "back to the projects index");
  });

  test("cancel on a dirty form confirms before leaving", async function (assert) {
    await visit("/categories/new?projectId=4");
    await fillIn(".form-kit__field[data-name='name'] input", "Half typed");
    await click(".category-form__cancel");

    assert
      .dom(".dialog-body")
      .exists("FormKit's dirty-form guard asks for confirmation");
    assert.strictEqual(
      currentURL(),
      "/categories/new?projectId=4",
      "still on the form until the user confirms"
    );

    await click(".dialog-footer .btn-primary");

    assert.strictEqual(
      currentURL(),
      "/c/faq/4",
      "confirming leaves for the project"
    );
  });
});

acceptance("Custom new category form (disabled)", function (needs) {
  const fixture = discoveryFixtures["/categories.json"];
  const categories = fixture.category_list.categories.map((cat) => {
    return { ...cat, is_project: ["blog", "faq"].includes(cat.slug) };
  });

  needs.site(cloneJSON({ categories }));
  needs.user({ can_create_category: true });
  needs.settings({
    projects_enabled: true,
    projects_custom_category_form: false,
  });

  needs.pretender((server, helper) => {
    server.get("/categories/types", () =>
      helper.response({
        types: [
          { id: "general", name: "General", configuration_schema: {} },
          { id: "other", name: "Other", configuration_schema: {} },
        ],
        counts: { general: 0, other: 0 },
      })
    );
  });

  test("falls back to the core flow when disabled", async function (assert) {
    await visit("/new-category");
    assert
      .dom(".projects-new-category")
      .doesNotExist("plugin form not rendered");
  });
});
