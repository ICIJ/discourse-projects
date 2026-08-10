import { getOwner } from "@ember/owner";
import { click, currentURL, fillIn, visit } from "@ember/test-helpers";
import { test } from "qunit";
import { cloneJSON } from "discourse/lib/object";
import PreloadStore from "discourse/lib/preload-store";
import categoryFixtures from "discourse/tests/fixtures/category-fixtures";
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

  test("a non-staff user visiting core's edit URL lands on the plugin form", async function (assert) {
    await visit("/c/faq/faq-child/500/edit");

    assert.strictEqual(
      currentURL(),
      "/categories/500/edit",
      "redirected to the plugin form"
    );
    assert.dom(".projects-edit-category").exists();
  });

  test("the redirect also catches a tab sub-route", async function (assert) {
    await visit("/c/faq/faq-child/500/edit/general");

    assert.strictEqual(currentURL(), "/categories/500/edit");
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
    desktop_category_page_style: "categories_only",
    projects_hide_projects_from_categories_page: true,
  });

  needs.pretender((server, helper) => {
    server.get("/c/500/show.json", () =>
      helper.response({ category: { ...OWNED, can_edit: true } })
    );
    server.get("/c/999/show.json", () =>
      helper.response(404, { errors: ["not found"] })
    );
    // core's editCategory route model hook, hit once the redirect initializer
    // exempts staff and lets the transition through to core's admin route.
    // Based on the full CategorySerializer fixture (rather than OWNED) so the
    // admin form's own rendering — e.g. available_category_types — has what
    // it needs.
    server.get("/c/faq/faq-child/500/find_by_slug.json", () =>
      helper.response({
        category: {
          ...categoryFixtures["/c/1/show.json"].category,
          ...OWNED,
          can_edit: true,
        },
      })
    );
  });

  function captureRedirect(context) {
    const router = getOwner(context).lookup("service:router");
    const replaceWith = router.replaceWith.bind(router);
    const redirect = { to: null };
    router.replaceWith = (url) => {
      redirect.to = url;
      return replaceWith("/404");
    };
    return redirect;
  }

  test("staff are sent to core's admin form instead of the plugin page", async function (assert) {
    // beforeModel's staff branch resolves the category via
    // Category.reloadById before it can build core's edit URL, rather than
    // trusting whatever copy is sitting in the site's category list (see the
    // route's coreEditUrl comment). Capturing the router call (rather than
    // letting the transition complete into core's admin edit-category page,
    // which needs its own unrelated fixtures) is the same technique the
    // create-form test uses to observe a redirect target without following
    // it.
    const redirect = captureRedirect(this);

    await visit("/categories/500/edit");

    assert.strictEqual(
      redirect.to,
      "/c/faq/faq-child/edit",
      "sent to core's admin edit form, with the full slug path"
    );
    assert
      .dom(".projects-edit-category")
      .doesNotExist("plugin page not rendered for staff");
  });

  test("the staff redirect survives the /categories page's parent-nulling mutation", async function (assert) {
    // categories-as-top-level.js nulls parent_category_id on every category
    // it hands to CategoryList.categoriesFrom, which then pushes those nulled
    // copies through Site#updateCategory (core category-list.js:39) —
    // mutating the global Category record unconditionally, regardless of
    // lazy_load_categories. Visiting /categories first reproduces that
    // mutation on OWNED's global copy, so the redirect must not be reading
    // that copy to still land on the full slug path.
    const preloaded = cloneJSON(fixture);
    preloaded.category_list.categories = [...categories, OWNED];
    PreloadStore.store("categories_list", preloaded);
    await visit("/categories");

    const redirect = captureRedirect(this);

    await visit("/categories/500/edit");

    assert.strictEqual(
      redirect.to,
      "/c/faq/faq-child/edit",
      "full slug path survives the /categories mutation"
    );
  });

  test("an unknown category id lands on /404", async function (assert) {
    await visit("/categories/999/edit");

    assert.strictEqual(currentURL(), "/404");
  });

  test("staff keep core's edit route", async function (assert) {
    await visit("/c/faq/faq-child/500/edit");

    assert
      .dom(".projects-edit-category")
      .doesNotExist("the plugin form is not used for staff");
    assert.notStrictEqual(
      currentURL(),
      "/categories/500/edit",
      "no redirect to the plugin form"
    );
  });
});
