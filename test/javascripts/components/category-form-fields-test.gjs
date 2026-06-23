import { hash } from "@ember/helper";
import { render } from "@ember/test-helpers";
import { module, test } from "qunit";
import Form from "discourse/components/form";
import { setupRenderingTest } from "discourse/tests/helpers/component-test";
import CategoryColorField from "discourse/plugins/discourse-projects/discourse/components/category-form/color-field";
import CategoryDescriptionField from "discourse/plugins/discourse-projects/discourse/components/category-form/description-field";
import CategoryLogoField from "discourse/plugins/discourse-projects/discourse/components/category-form/logo-field";
import CategoryTitleField from "discourse/plugins/discourse-projects/discourse/components/category-form/title-field";

module("Projects | Component | category-form fields", function (hooks) {
  setupRenderingTest(hooks);

  test("title field renders a text input", async function (assert) {
    await render(
      <template>
        <Form @data={{hash name=""}} as |form|>
          <CategoryTitleField @form={{form}} />
        </Form>
      </template>
    );
    assert.dom(".form-kit__field[data-name='name'] input").exists();
  });

  test("description field renders a textarea", async function (assert) {
    await render(
      <template>
        <Form @data={{hash description=""}} as |form|>
          <CategoryDescriptionField @form={{form}} />
        </Form>
      </template>
    );
    assert.dom(".form-kit__field[data-name='description'] textarea").exists();
  });

  test("color field renders a color control", async function (assert) {
    await render(
      <template>
        <Form @data={{hash color="0088CC"}} as |form|>
          <CategoryColorField @form={{form}} />
        </Form>
      </template>
    );
    assert.dom(".form-kit__field[data-name='color']").exists();
  });

  test("logo field renders an image uploader for its name", async function (assert) {
    await render(
      <template>
        <Form @data={{hash logo=null}} as |form|>
          <CategoryLogoField
            @form={{form}}
            @name="logo"
            @title="Logo"
            @uploadType="logo"
          />
        </Form>
      </template>
    );
    assert
      .dom(".form-kit__field[data-name='logo'] .category-logo-uploader")
      .exists();
  });
});
