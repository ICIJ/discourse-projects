import { setupTest } from "ember-qunit";
import { module, test } from "qunit";
import pretender, { response } from "discourse/tests/helpers/create-pretender";
import createCategory from "discourse/plugins/discourse-projects/discourse/lib/create-category";

module("Projects | Unit | create-category", function (hooks) {
  setupTest(hooks);

  test("maps attrs to the snake_case create payload", async function (assert) {
    let body;
    pretender.post("/categories", (request) => {
      body = JSON.parse(request.requestBody);
      return response({ category: { id: 42, slug: "new-cat" } });
    });

    const category = await createCategory({
      name: "Investigation",
      parentCategoryId: 7,
      description: "About it",
      color: "FF0000",
      uploadedLogoId: 11,
      uploadedLogoDarkId: 12,
      permissions: { everyone: 1 },
    });

    assert.strictEqual(category.id, 42, "resolves to the created category");
    assert.deepEqual(body, {
      name: "Investigation",
      parent_category_id: 7,
      description: "About it",
      color: "FF0000",
      uploaded_logo_id: 11,
      uploaded_logo_dark_id: 12,
      permissions: { everyone: 1 },
    });
  });
});
