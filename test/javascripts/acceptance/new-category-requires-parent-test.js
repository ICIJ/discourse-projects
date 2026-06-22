import { visit } from "@ember/test-helpers";
import { test } from "qunit";
import { cloneJSON } from "discourse/lib/object";
import discoveryFixtures from "discourse/tests/fixtures/discovery-fixtures";
import { acceptance } from "discourse/tests/helpers/qunit-helpers";

acceptance("New category requires a parent", function (needs) {
  const fixture = discoveryFixtures["/categories.json"];
  const categories = fixture.category_list.categories.map((cat) => {
    return { ...cat, is_project: ["blog", "faq"].includes(cat.slug) };
  });

  needs.site(cloneJSON({ categories }));
  // Admin user, and the requires-parent setting is intentionally NOT set:
  // enforcement must be unconditional.
  needs.user({ admin: true, can_create_category: true });
  needs.settings({ projects_enabled: true });

  needs.pretender((server, helper) => {
    const projects = categories.filter((cat) => cat.is_project);
    server.get("/projects.json", () => helper.response({ projects }));
  });

  test("entering /new-category always forces the project-picker modal (even admins, no setting)", async function (assert) {
    await visit("/new-category");
    assert
      .dom(".d-modal")
      .exists("the project-picker modal is forced regardless of role/setting");
  });
});
