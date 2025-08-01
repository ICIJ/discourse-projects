import { render } from "@ember/test-helpers";
import { module, test } from "qunit";
import { setupRenderingTest } from "discourse/tests/helpers/component-test";
import NewSubcategoryButton from "discourse/plugins/discourse-projects/discourse/components/new-subcategory-button";

module("Projects | Component | NewSubcategoryButton", function (hooks) {
  setupRenderingTest(hooks);

  test("when button is rendered", async function (assert) {
    await render(<template><NewSubcategoryButton /></template>);
    assert
      .dom(".new-subcategory-button")
      .exists("it shows the new subcategory button");
  });
});
