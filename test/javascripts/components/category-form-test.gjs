import { render } from "@ember/test-helpers";
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
});
