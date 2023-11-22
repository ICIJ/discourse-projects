import { render } from "@ember/test-helpers";
import hbs from "htmlbars-inline-precompile";
import { module, test } from "qunit";
import { setupRenderingTest } from "discourse/tests/helpers/component-test";

module("Projects | Component | ProjectBanner", function (hooks) {
  setupRenderingTest(hooks);

  this.category = {
    id: "1",
    slug: "foo",
    name: "Foo",
  };

  test("when banner is rendered", async function (assert) {
    await render(hbs`<ProjectBanner @category={{this.category}}/>`);
    assert.dom(".project-banner__wrapper").exists("it shows a project banner");
    assert
      .dom(".project-banner__wrapper__link")
      .exists("it shows a link to the corresponding category");
    assert.dom(".project-banner__wrapper__link").hasText("Foo");
    assert
      .dom(".project-banner__wrapper__link")
      .hasAttribute("href", "/c/foo/1");
  });
});
