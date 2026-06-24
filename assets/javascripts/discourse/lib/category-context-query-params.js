// Maps the category a user was viewing to the new-category form's preselection
// query params:
//   - a project                    -> preselect that project;
//   - a category inside a project   -> preselect the project AND that category
//                                      as the in-project parent;
//   - anywhere else (no category)    -> no preselection.
// Both keys are always set (nulled when unused) so a previous selection can't
// linger via Ember's sticky query params. The single source of truth for this
// mapping; callers (the New-subcategory button, the route redirect, the
// project-members page) must not reimplement it.
export default function categoryContextQueryParams(category) {
  if (category?.is_project) {
    return { projectId: category.id, parentCategoryId: null };
  }

  if (category) {
    // `project` is the resolved project ancestor; fall back to the immediate
    // parent when it isn't loaded (mirrors composer-project-chooser). The form
    // re-validates the seed and drops it if it can't resolve to a project.
    return {
      projectId: category.project?.id ?? category.parent_category_id ?? null,
      parentCategoryId: category.id,
    };
  }

  return { projectId: null, parentCategoryId: null };
}
