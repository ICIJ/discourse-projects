import { click, fillIn, visit } from "@ember/test-helpers";
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
  needs.settings({
    projects_enabled: true,
    projects_custom_category_form: true,
  });

  needs.pretender((server, helper) => {
    const projects = categories.filter((cat) => cat.is_project);
    server.get("/projects.json", () => helper.response({ projects }));
  });

  test("cannot submit the form without a project", async function (assert) {
    await visit("/categories/new");
    await fillIn(".form-kit__field[data-name='name'] input", "Orphan");
    await click(".form-kit__button[type='submit']");
    assert
      .dom(".form-kit__field[data-name='projectId'] .form-kit__errors")
      .exists("the project field shows a required error");
  });
});
