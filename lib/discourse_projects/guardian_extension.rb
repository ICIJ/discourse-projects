# frozen_string_literal: true

module DiscourseProjects
  # Extends the Guardian to allow non-admin users who can create
  # categories to also edit them, as long as the category is not
  # a project. Without this, Discourse redirects to the editCategory
  # route after creating a subcategory, which returns a 404 for
  # non-admin users.
  module GuardianExtension
    def can_edit_category?(category)
      (can_create_category? and not category.project?) || super
    end
  end
end
