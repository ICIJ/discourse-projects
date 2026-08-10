import { getOwner } from "@ember/owner";
import { click, currentURL, fillIn, visit } from "@ember/test-helpers";
import { test } from "qunit";
import { cloneJSON } from "discourse/lib/object";
import discoveryFixtures from "discourse/tests/fixtures/discovery-fixtures";
import { acceptance } from "discourse/tests/helpers/qunit-helpers";

// The category under edit: a subcategory of the "faq" project (id 4) in
// discovery-fixtures, owned by the signed-in user.
const OWNED = {
  id: 500,
  name: "FAQ Child",
  slug: "faq-child",
  color: "AB9364",
  text_color: "FFFFFF",
  parent_category_id: 4,
  is_project: false,
  project: { id: 4, name: "faq", slug: "faq" },
};

acceptance("Custom edit category form", function (needs) {
  const fixture = discoveryFixtures["/categories.json"];
  const categories = fixture.category_list.categories.map((cat) => {
    return { ...cat, is_project: ["blog", "faq"].includes(cat.slug) };
  });

  let put = null;

  needs.site(cloneJSON({ categories: [...categories, OWNED] }));
  needs.user({ can_create_category: true, admin: false, moderator: false });
  needs.settings({
    projects_enabled: true,
    projects_custom_category_form: true,
    desktop_category_page_style: "categories_only",
  });

  needs.pretender((server, helper) => {
    put = null;
    const projects = categories.filter((cat) => cat.is_project);
    server.get("/projects.json", () => helper.response({ projects }));
    server.get("/c/500/show.json", () =>
      helper.response({
        category: {
          ...OWNED,
          description: "<p>The blurb</p>",
          topic_url: "/t/about-faq-child/9",
          can_edit: true,
          can_delete: false,
          cannot_delete_reason:
            "Can't delete this category because it has 3 topics.",
        },
      })
    );
    server.put("/categories/500", (request) => {
      put = JSON.parse(request.requestBody);
      return helper.response({ category: { ...OWNED, name: "Renamed" } });
    });
    server.get("/c/faq/faq-child/500/l/latest.json", () =>
      helper.response(cloneJSON(discoveryFixtures["/c/bug/1/l/latest.json"]))
    );
  });

  test("renders the plugin form pre-filled from the category", async function (assert) {
    await visit("/categories/500/edit");

    assert.dom(".projects-edit-category").exists("renders the plugin page");
    assert
      .dom(".form-kit__field[data-name='name'] input")
      .hasValue("FAQ Child", "title pre-filled");
    assert
      .dom(".category-form__delete")
      .hasClass("btn-default", "delete offered but blocked");

    // cannot_delete_reason only exists on the full CategorySerializer payload
    // from /c/500/show.json — a model sourced from the site's category list
    // (SiteCategorySerializer, or CategoryList) would leave this button inert.
    await click(".category-form__delete");
    assert
      .dom(".category-form__delete-reason")
      .hasText(
        "Can't delete this category because it has 3 topics.",
        "server's delete-block reason rendered"
      );
  });

  test("saving sends a PUT and returns to the category", async function (assert) {
    await visit("/categories/500/edit");
    await fillIn(".form-kit__field[data-name='name'] input", "Renamed");
    await click(".form-kit__button[type='submit']");

    assert.strictEqual(put.name, "Renamed", "new title sent");
    assert.notOk("parent_category_id" in put, "category not moved");
    assert.strictEqual(
      currentURL(),
      "/c/faq/faq-child/500",
      "back to the category"
    );
  });

  test("cancel returns to the category without saving", async function (assert) {
    await visit("/categories/500/edit");
    await click(".category-form__cancel");

    assert.strictEqual(currentURL(), "/c/faq/faq-child/500");
    assert.strictEqual(put, null, "nothing was saved");
  });
});

acceptance("Custom edit category form (staff)", function (needs) {
  const fixture = discoveryFixtures["/categories.json"];
  const categories = fixture.category_list.categories.map((cat) => {
    return { ...cat, is_project: ["blog", "faq"].includes(cat.slug) };
  });

  needs.site(cloneJSON({ categories: [...categories, OWNED] }));
  needs.user({ admin: true });
  needs.settings({
    projects_enabled: true,
    projects_custom_category_form: true,
  });

  test("staff are sent to core's admin form instead of the plugin page", async function (assert) {
    // beforeModel's staff branch resolves the category via
    // Category.asyncFindById before it can build core's edit URL — the same
    // branch a plain findById would silently mis-resolve for a category
    // outside the lazy-loaded set, or after /categories has nulled a category's
    // parent_category_id (see the route's coreEditUrl comment). Capturing the
    // router call (rather than letting the transition complete into core's
    // admin edit-category page, which needs its own unrelated fixtures) is
    // the same technique the create-form test uses to observe a redirect
    // target without following it.
    const router = getOwner(this).lookup("service:router");
    const replaceWith = router.replaceWith.bind(router);
    let redirectedTo = null;
    router.replaceWith = (url) => {
      redirectedTo = url;
      return replaceWith("/404");
    };

    await visit("/categories/500/edit");

    assert.strictEqual(
      redirectedTo,
      "/c/faq/faq-child/edit",
      "sent to core's admin edit form, with the full slug path"
    );
    assert
      .dom(".projects-edit-category")
      .doesNotExist("plugin page not rendered for staff");
  });
});
