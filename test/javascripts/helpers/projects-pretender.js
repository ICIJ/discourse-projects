// Default handler for the project list. The ProjectService fetches
// /projects.json on init, which is triggered indirectly (e.g. via the
// redirect-new-category initializer) in component tests that never mock it.
// Without a default, pretender throws "Unhandled request" and the render never
// settles, timing the test out. Acceptance tests that need specific projects
// register their own /projects.json handler, which takes precedence.
export default function (helpers) {
  const { response } = helpers;

  this.get("/projects.json", () => response({ projects: [] }));
}
