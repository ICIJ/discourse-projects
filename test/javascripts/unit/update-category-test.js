import { setupTest } from "ember-qunit";
import { module, test } from "qunit";
import pretender, { response } from "discourse/tests/helpers/create-pretender";
import updateCategory from "discourse/plugins/discourse-projects/discourse/lib/update-category";

module("Projects | Unit | update-category", function (hooks) {
  setupTest(hooks);

  test("maps attrs to the snake_case update payload", async function (assert) {
    let body;
    pretender.put("/categories/42", (request) => {
      body = JSON.parse(request.requestBody);
      return response({ category: { id: 42, name: "Renamed" } });
    });

    const category = await updateCategory(42, {
      name: "Renamed",
      color: "FF0000",
      uploadedLogoId: 11,
      uploadedLogoDarkId: 12,
    });

    assert.strictEqual(category.id, 42, "resolves to the updated category");
    assert.deepEqual(body, {
      name: "Renamed",
      color: "FF0000",
      uploaded_logo_id: 11,
      uploaded_logo_dark_id: 12,
    });
  });

  test("never sends parent_category_id or permissions", async function (assert) {
    let body;
    pretender.put("/categories/7", (request) => {
      body = JSON.parse(request.requestBody);
      return response({ category: { id: 7 } });
    });

    await updateCategory(7, { name: "Only a name" });

    assert.notOk("parent_category_id" in body, "category cannot be moved");
    assert.notOk("permissions" in body, "permissions are left untouched");
    assert.strictEqual(body.uploaded_logo_id, null, "clears an absent logo");
  });
});
