import { click, fillIn, render } from "@ember/test-helpers";
import { module, test } from "qunit";
import sinon from "sinon";
import DiscourseURL from "discourse/lib/url";
import Category from "discourse/models/category";
import { setupRenderingTest } from "discourse/tests/helpers/component-test";
import pretender, { response } from "discourse/tests/helpers/create-pretender";
import CategoryForm from "discourse/plugins/discourse-projects/discourse/components/category-form";

module("Projects | Component | category-form", function (hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function () {
    pretender.get("/projects.json", () => response({ projects: [] }));
  });

  test("renders all fields and a submit button", async function (assert) {
    await render(<template><CategoryForm @projectId={{null}} /></template>);
    assert.dom(".form-kit__field[data-name='projectId']").exists("project");
    assert
      .dom(".form-kit__field[data-name='parentCategoryId']")
      .exists("parent");
    assert.dom(".form-kit__field[data-name='name']").exists("title");
    assert
      .dom(".form-kit__field[data-name='description']")
      .exists("description");
    assert.dom(".form-kit__field[data-name='color']").exists("color");
    assert.dom(".form-kit__field[data-name='logo']").exists("logo");
    assert.dom(".form-kit__field[data-name='logoDark']").exists("logo dark");
    assert.dom(".form-kit__button[type='submit']").exists("submit");
  });

  test("resolves parent permissions at submit time (no race)", async function (assert) {
    // Stub the parent category's show endpoint — permissions are fetched at
    // submit, not on construction, so a fast submit cannot bypass them.
    pretender.get("/c/42/show.json", () =>
      response({
        category: {
          id: 42,
          group_permissions: [
            { group_name: "staff", permission_type: 1 },
            { group_name: "trust_level_0", permission_type: 2 },
          ],
        },
      })
    );

    let postedBody;
    pretender.post("/categories", (request) => {
      postedBody = JSON.parse(request.requestBody);
      return response({
        category: {
          id: 99,
          slug: "new-sub",
          name: "New Sub",
          parent_category_id: 42,
        },
      });
    });

    let createdCategory;
    const handleCreated = (cat) => {
      createdCategory = cat;
    };

    const projectId = 42;

    await render(
      <template>
        <CategoryForm @projectId={{projectId}} @onCreated={{handleCreated}} />
      </template>
    );

    await fillIn(".form-kit__field[data-name='name'] input", "New Sub");
    await click(".form-kit__button[type='submit']");

    // Permissions must match what show.json returned — NOT an empty object.
    assert.deepEqual(
      postedBody?.permissions,
      { staff: 1, trust_level_0: 2 },
      "POST /categories carries inherited permissions resolved at submit time"
    );
    assert.ok(createdCategory, "onCreated callback is invoked");
  });

  test("edit mode pre-fills from the category and locks its location", async function (assert) {
    const category = Category.create({
      id: 501,
      name: "Existing",
      slug: "existing",
      color: "AB9364",
      parent_category_id: 4,
      project: { id: 4, name: "faq", slug: "faq" },
      description: "<p>The blurb</p>",
      topic_url: "/t/about-existing/9",
    });

    await render(<template><CategoryForm @category={{category}} /></template>);

    assert
      .dom(".form-kit__field[data-name='name'] input")
      .hasValue("Existing", "title pre-filled");
    assert
      .dom(".form-kit__field[data-name='projectId'] .select-kit")
      .hasClass("is-disabled", "project chooser locked");
    assert
      .dom(".form-kit__field[data-name='parentCategoryId'] .select-kit")
      .hasClass("is-disabled", "parent chooser locked");
    assert
      .dom(".form-kit__field[data-name='description']")
      .doesNotExist("the markdown textarea is replaced in edit mode");
    assert
      .dom(".category-form__description")
      .includesText("The blurb", "cooked description rendered read-only");
    assert
      .dom(".category-form__edit-description")
      .exists("a button opens the definition topic in the composer");
  });

  test("edit mode saves through PUT /categories/:id", async function (assert) {
    // Rendering tests don't have a real router; stub the post-save redirect
    // the same way core does (select-kit/category-drop-test.gjs).
    sinon.stub(DiscourseURL, "routeTo");

    let body;
    pretender.put("/categories/501", (request) => {
      body = JSON.parse(request.requestBody);
      return response({ category: { id: 501, name: "Renamed" } });
    });

    const category = Category.create({
      id: 501,
      name: "Existing",
      slug: "existing",
      color: "AB9364",
      parent_category_id: 4,
      project: { id: 4, name: "faq", slug: "faq" },
      description: "<p>The blurb</p>",
      topic_url: "/t/about-existing/9",
    });

    await render(<template><CategoryForm @category={{category}} /></template>);

    await fillIn(".form-kit__field[data-name='name'] input", "Renamed");
    await click(".form-kit__button[type='submit']");

    assert.strictEqual(body.name, "Renamed", "new title sent");
    assert.strictEqual(body.color, "AB9364", "existing colour preserved");
    assert.notOk(
      "parent_category_id" in body,
      "the category is never moved from the edit form"
    );
  });

  test("edit mode submits when the category itself is a project (no @project)", async function (assert) {
    // Category#project is nil for a category that IS a project, so
    // seededProjectId seeds null. The locked project chooser must not block
    // submit with a "required" validation error the user can't fix.
    sinon.stub(DiscourseURL, "routeTo");

    let putCalled = false;
    pretender.put("/categories/501", () => {
      putCalled = true;
      return response({ category: { id: 501, name: "Renamed" } });
    });

    const category = Category.create({
      id: 501,
      name: "Existing",
      slug: "existing",
      color: "AB9364",
      parent_category_id: null,
      project: null,
      description: "<p>The blurb</p>",
      topic_url: "/t/about-existing/9",
    });

    await render(<template><CategoryForm @category={{category}} /></template>);

    await fillIn(".form-kit__field[data-name='name'] input", "Renamed");
    await click(".form-kit__button[type='submit']");

    assert.true(putCalled, "the PUT fires despite the empty project field");
  });
});
