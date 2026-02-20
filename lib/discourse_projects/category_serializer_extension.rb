# frozen_string_literal: true

module DiscourseProjects
  # Extends CategorySerializer to expose group_permissions and available_groups
  # to users who can create categories (admins and eligible moderators).
  #
  # By default, Discourse only includes these fields when `scope.can_edit?(category)`
  # is true, which requires the user to already have edit access to that specific
  # category. We relax this to `can_create_category?` so that project managers can
  # see and configure permissions on categories they create.
  #
  # We use a prepended module instead of `add_to_serializer` because Discourse
  # deprecated using `add_to_serializer` to directly override `include_*?` methods.
  # The recommended alternative (`include_condition` keyword) only works when
  # defining new attributes, not when overriding existing ones. Prepending a module
  # is the only supported way to override these built-in inclusion methods.
  #
  # The `scope.present?` guard is necessary because CategorySerializer can be
  # instantiated without a scope in some internal contexts (e.g. `publish_category`),
  # which would otherwise raise a NoMethodError.
  module CategorySerializerExtension
    def include_group_permissions?
      scope.present? && Guardian.new(scope.user).can_create_category?
    end

    def include_available_groups?
      scope.present? && Guardian.new(scope.user).can_create_category?
    end
  end
end
