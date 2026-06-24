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

  let posted = null;

  needs.site(cloneJSON({ categories }));
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
    await visit("/categories/new?projectId=2");
    await fillIn(".form-kit__field[data-name='name'] input", "My Category");
    await click(".form-kit__button[type='submit']");

    assert.strictEqual(posted.parent_category_id, 2, "parent from query param");
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
