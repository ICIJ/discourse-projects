# frozen_string_literal: true

module DiscourseProjects
  # Extends the Guardian so a user who is allowed to create categories can also
  # edit the ones they created. Projects (top-level categories) stay staff-only.
  #
  # Delete needs no override of its own: core's `can_delete_category?` is
  # `can_edit_category? && topic_count <= 0 && !uncategorized? && !has_children?`
  # (lib/guardian/category_guardian.rb), so restricting edit to the creator
  # restricts delete to the creator too, and core's "must be empty and
  # childless" rule stays in force.
  module GuardianExtension
    def can_edit_category?(category)
      super || (can_create_category? && !category.project? && own_category?(category))
    end

    private

    def own_category?(category)
      authenticated? && category.user_id == user.id
    end
  end
end
