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

    # `/site.json` serializes each category's `can_edit` from this method, not
    # from `can_edit_category?` (core app/models/site.rb), so the client's edit
    # button needs the same ownership rule applied here, or a non-staff creator
    # never sees an entry point to their own category.
    #
    # Called once per visible category on every page load (Site#categories),
    # so the ownership branch below must bail before touching the database
    # for the common case of a user who cannot create categories at all.
    def can_edit_serialized_category?(category_id:, read_restricted:)
      return true if super
      return false unless can_create_category?

      category = Category.find_by(id: category_id)
      return false if category.nil?

      can_edit_category?(category)
    end

    private

    # Mirrors core's own moderator conjunct on `can_edit_category?`
    # (`can_see_category?`, lib/guardian/category_guardian.rb): a creator
    # removed from the group granting them visibility loses edit and delete
    # too, not only staff.
    def own_category?(category)
      authenticated? && category.user_id == user.id && can_see_category?(category)
    end
  end
end
