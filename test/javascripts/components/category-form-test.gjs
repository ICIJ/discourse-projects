import { click, fillIn, render } from "@ember/test-helpers";
import { module, test } from "qunit";
import { setupRenderingTest } from "discourse/tests/helpers/component-test";
import pretender, { response } from "discourse/tests/helpers/create-pretender";
import CategoryForm from "discourse/plugins/discourse-projects/discourse/components/category-form";

module("Projects | Component | category-form", function (hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function () {
    pretender.get("/projects.json", () => response({ projects: [] }));
  });

  test("renders all fields and a submit button", async function (assert) {
    await render(
      <template><CategoryForm @parentCategoryId={{null}} /></template>
    );
    assert
      .dom(".form-kit__field[data-name='parentCategoryId']")
      .exists("project");
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

    const parentCategoryId = 42;

    await render(
      <template>
        <CategoryForm
          @parentCategoryId={{parentCategoryId}}
          @onCreated={{handleCreated}}
        />
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
});
