import { setupTest } from "ember-qunit";
import { module, test } from "qunit";
import Site from "discourse/models/site";
import { editedCategoryId } from "discourse/plugins/discourse-projects/discourse/initializers/redirect-edit-category";

// The QUnit environment always loads the admin bundle, so a real visit() to
// "/c/.../edit" always resolves to the admin editCategory* route, never to
// discovery.category — core's glob route only swallows the URL for a real
// non-staff session. That branch of editedCategoryId can't be driven through
// an actual transition here, so it's exercised directly with fake
// transitions instead.
function discoveryTransition(categorySlugPathWithId) {
  return {
    to: {
      name: "discovery.category",
      params: { category_slug_path_with_id: categorySlugPathWithId },
    },
  };
}

module("Projects | Unit | redirect-edit-category", function (hooks) {
  setupTest(hooks);

  test("editedCategoryId (discovery.category branch)", function (assert) {
    const site = Site.current();
    site.updateCategory({ id: 41, slug: "parent" });
    site.updateCategory({ id: 42, slug: "child", parent_category_id: 41 });
    // Core reserves only "none" as a category slug (Category::RESERVED_SLUGS
    // in app/models/category.rb) — a category can genuinely be slugged
    // "edit".
    site.updateCategory({ id: 43, slug: "edit", parent_category_id: 41 });

    assert.strictEqual(
      editedCategoryId(discoveryTransition("parent/edit")),
      null,
      "a real category slugged 'edit' is left alone, not read as an edit URL"
    );
    assert.strictEqual(
      editedCategoryId(discoveryTransition("parent/child")),
      null,
      "a plain category page is left alone"
    );
    assert.strictEqual(
      editedCategoryId(discoveryTransition("parent/child/42")),
      null,
      "an id-bearing category page is left alone"
    );
    assert.strictEqual(
      editedCategoryId(discoveryTransition("parent/child/edit")),
      42,
      "the real (id-less) edit URL still resolves to the category being edited"
    );
    assert.strictEqual(
      editedCategoryId(discoveryTransition("parent/child/42/edit")),
      42,
      "the id-bearing edit URL still resolves"
    );
  });
});
