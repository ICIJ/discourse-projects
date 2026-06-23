import { setupTest } from "ember-qunit";
import { module, test } from "qunit";
import pretender, { response } from "discourse/tests/helpers/create-pretender";
import fetchCategoryPermissions from "discourse/plugins/discourse-projects/discourse/lib/fetch-category-permissions";

module("Projects | Unit | fetch-category-permissions", function (hooks) {
  setupTest(hooks);

  test("returns parent group permissions keyed by group name", async function (assert) {
    pretender.get("/c/5/show.json", () =>
      response({
        category: {
          id: 5,
          group_permissions: [
            { group_name: "staff", permission_type: 1 },
            { group_name: "trust_level_2", permission_type: 2 },
          ],
        },
      })
    );

    const permissions = await fetchCategoryPermissions(5);
    assert.deepEqual(permissions, { staff: 1, trust_level_2: 2 });
  });
});
