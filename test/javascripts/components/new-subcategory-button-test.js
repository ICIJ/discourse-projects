import { render } from "@ember/test-helpers";
import sinon from "sinon";
import hbs from "htmlbars-inline-precompile";
import { module, test } from "qunit";
import { setupRenderingTest } from "discourse/tests/helpers/component-test";

module("Projects | Component | NewSubcategoryButton", function (hooks) {
  setupRenderingTest(hooks);

  test("when button is rendered", async function (assert) {
    sinon.stub(this.owner.lookup("controller:discovery"), "category").value(null);
    await render(hbs`<NewSubcategoryButton />`);
    assert.dom(".new-subcategory-button").exists("it shows the new subcategory button");
  });
});