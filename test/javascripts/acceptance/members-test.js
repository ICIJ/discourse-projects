import { fillIn, visit } from "@ember/test-helpers";
import { test } from "qunit";
import { cloneJSON } from "discourse/lib/object";
import categoryFixtures from "discourse/tests/fixtures/category-fixtures";
import discoveryFixtures from "discourse/tests/fixtures/discovery-fixtures";
import groupFixtures from "discourse/tests/fixtures/group-fixtures";
import {
  acceptance,
  count,
  exists,
  queryAll,
} from "discourse/tests/helpers/qunit-helpers";

acceptance("Members", function (needs) {
  // Use Discourse's ficture for categories
  // @see https://github.com/discourse/discourse/blob/main/app/assets/javascripts/discourse/tests/fixtures/discovery-fixtures.js
  const categories =
    discoveryFixtures["/categories.json"].category_list.categories;

  needs.site(cloneJSON({ categories }));
  needs.user();
  needs.settings({ projects_enabled: true });

  needs.pretender((server, helper) => {
    server.get("/projects.json", () =>
      helper.response({ projects: [] })
    );

    server.get("/groups/:group-id/members.json", () => {
      // Use Discourse's fixture for member
      // @see https://github.com/discourse/iscourse/blob/main/app/assets/javascripts/discourse/tests/fixtures/group-fixtures.js
      return helper.response(
        cloneJSON(groupFixtures["/groups/discourse/members.json"])
      );
    });

    server.get("/c/:slug/find_by_slug.json", () => {
      // Use Discourse's fixture for the first category
      // @see https://github.com/discourse/iscourse/blob/main/app/assets/javascripts/discourse/tests/fixtures/category-fixtures.js
      return helper.response(cloneJSON(categoryFixtures["/c/1/show.json"]));
    });
  });

  test("Members page exists", async function (assert) {
    await visit("/c/bug/members");
    assert.ok(exists(".members"), "it shows a members page");
  });

  test("Members page list 7 members", async function (assert) {
    await visit("/c/bug/members");
    assert.ok(
      exists(".members .directory-table-container"),
      "it shows a members list"
    );
    assert.strictEqual(count(".members .directory-table__row"), 7);
  });

  test("Members page should filter members by username", async function (assert) {
    await visit("/c/bug/members");
    await fillIn(".members-header-search", "awesomerobot");
    assert.ok(
      exists(".members .directory-table-container"),
      "it shows a members list"
    );
    assert.strictEqual(count(".members .directory-table__row"), 1);
  });

  test("Members page list members sorted by username by default", async function (assert) {
    await visit("/c/bug/members");
    const usernames = queryAll(".members .directory-table-container .username");
    assert.strictEqual(usernames[0].innerText.trim(), "Username");
    assert.strictEqual(usernames[1].innerText.trim(), "awesomerobot");
  });
});
