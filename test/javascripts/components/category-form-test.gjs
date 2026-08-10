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

  test("a deletable category gets a danger delete button", async function (assert) {
    const category = Category.create({
      id: 501,
      name: "Existing",
      slug: "existing",
      color: "AB9364",
      parent_category_id: 4,
      project: { id: 4, name: "faq", slug: "faq" },
      description: "<p>The blurb</p>",
      topic_url: "/t/about-existing/9",
      can_delete: true,
    });

    await render(<template><CategoryForm @category={{category}} /></template>);

    assert
      .dom(".category-form__delete")
      .hasClass("btn-danger", "delete is offered as a destructive action");
    assert
      .dom(".category-form__delete-reason")
      .doesNotExist("nothing to explain when deletion is allowed");
  });

  test("a blocked delete stays visible and explains itself on click", async function (assert) {
    const category = Category.create({
      id: 501,
      name: "Existing",
      slug: "existing",
      color: "AB9364",
      parent_category_id: 4,
      project: { id: 4, name: "faq", slug: "faq" },
      description: "<p>The blurb</p>",
      topic_url: "/t/about-existing/9",
      can_delete: false,
      cannot_delete_reason:
        "Can't delete this category because it has 3 topics.",
    });

    await render(<template><CategoryForm @category={{category}} /></template>);

    assert
      .dom(".category-form__delete")
      .hasClass("btn-default", "the button stays available, not destructive");
    assert
      .dom(".category-form__delete-reason")
      .doesNotExist("the reason is hidden until asked for");

    await click(".category-form__delete");

    assert
      .dom(".category-form__delete-reason")
      .includesText(
        "it has 3 topics",
        "clicking reveals the server's reason above the actions"
      );
  });

  test("create mode has no delete button", async function (assert) {
    await render(<template><CategoryForm @projectId={{null}} /></template>);

    assert.dom(".category-form__delete").doesNotExist();
    assert.dom(".category-form__cancel").exists("cancel is still there");
    assert
      .dom(".form-kit__button[type='submit']")
      .exists("submit is still there");
  });

  test("a blocked delete with no server reason reveals nothing on click", async function (assert) {
    // SiteCategorySerializer omits cannot_delete_reason entirely (unlike the
    // full CategorySerializer sent to the creator); the button must not pop
    // an empty alert when that happens.
    const category = Category.create({
      id: 501,
      name: "Existing",
      slug: "existing",
      parent_category_id: 4,
      can_delete: false,
    });

    await render(<template><CategoryForm @category={{category}} /></template>);
    await click(".category-form__delete");

    assert
      .dom(".category-form__delete-reason")
      .doesNotExist("no reason from the server means nothing to show");
  });

  test("confirming delete issues the DELETE and navigates away", async function (assert) {
    sinon.stub(DiscourseURL, "routeTo");
    sinon
      .stub(this.owner.lookup("service:dialog"), "deleteConfirm")
      .callsFake((params) => params.didConfirm());

    let deleted = false;
    pretender.delete("/categories/501", () => {
      deleted = true;
      return response({});
    });

    const category = Category.create({
      id: 501,
      name: "Existing",
      slug: "existing",
      parent_category_id: 4,
      can_delete: true,
    });

    await render(<template><CategoryForm @category={{category}} /></template>);
    await click(".category-form__delete");

    assert.true(deleted, "the DELETE hits the category's own URL");
    assert.true(
      DiscourseURL.routeTo.calledOnce,
      "navigates away once the category is gone"
    );
  });

  test("a failed delete does not navigate", async function (assert) {
    sinon.stub(DiscourseURL, "routeTo");
    sinon
      .stub(this.owner.lookup("service:dialog"), "deleteConfirm")
      .callsFake((params) => params.didConfirm());

    pretender.delete("/categories/501", () => response(500, {}));

    const category = Category.create({
      id: 501,
      name: "Existing",
      slug: "existing",
      parent_category_id: 4,
      can_delete: true,
    });

    await render(<template><CategoryForm @category={{category}} /></template>);
    await click(".category-form__delete");

    assert.false(
      DiscourseURL.routeTo.called,
      "a failed delete must not navigate"
    );
  });
});
