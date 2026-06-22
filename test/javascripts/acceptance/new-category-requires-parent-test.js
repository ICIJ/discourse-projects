import { getOwner } from "@ember/owner";
import { visit } from "@ember/test-helpers";
import { test } from "qunit";
import { cloneJSON } from "discourse/lib/object";
import discoveryFixtures from "discourse/tests/fixtures/discovery-fixtures";
import { acceptance } from "discourse/tests/helpers/qunit-helpers";

acceptance("New category creator", function (needs) {
  const fixture = discoveryFixtures["/categories.json"];
  const categories = fixture.category_list.categories.map((cat) => {
    return { ...cat, is_project: ["blog", "faq"].includes(cat.slug) };
  });

  needs.site(cloneJSON({ categories }));
  needs.user({ admin: true, can_create_category: true });
  needs.settings({ projects_enabled: true });

  needs.pretender((server, helper) => {
    const projects = categories.filter((cat) => cat.is_project);
    server.get("/projects.json", () => helper.response({ projects }));
    // Two types so the setup step does not auto-advance; we only assert the
    // flow renders, not the full form.
    server.get("/categories/types", () =>
      helper.response({
        types: [
          { id: "general", name: "General", configuration_schema: {} },
          { id: "other", name: "Other", configuration_schema: {} },
        ],
        counts: { general: 0, other: 0 },
      })
    );
  });

  // The project requirement is now enforced by the required Project tab + the
  // save-time validator, NOT by force-opening a modal on entry (which blanked
  // direct navigation). Entering /new-category must render the creator.
  test("entering /new-category renders the creator without force-opening a modal", async function (assert) {
    await visit("/new-category");
    assert
      .dom(".d-modal")
      .doesNotExist("no modal is force-opened on direct entry");
    const router = getOwner(this).lookup("service:router");
    assert.true(
      router.currentRouteName.startsWith("newCategory"),
      "the new-category flow renders (page is not blank)"
    );
  });
});
