# frozen_string_literal: true

module DiscourseProjects
  # A category owned by a non-staff user must live inside a project they can see.
  #
  # This cannot live in the guardian: `can_create_category?` is called with no
  # parent, and `can_edit_category?` only sees the category's current parent, not
  # the one the request is trying to set. It cannot live in the model either,
  # which has no acting user on update. The controller is where both the acting
  # user and the incoming params are in scope.
  module CategoriesControllerExtension
    def create
      return render_parent_required if missing_visible_parent?
      super
    end

    def update
      # Checked before the placement guard below: core's `fetch_category`
      # does no visibility check, so without this a non-staff user could
      # probe a category they cannot edit for its real parent id by reading
      # 422 (differs) vs 403 (matches) off the placement error alone.
      guardian.ensure_can_edit!(@category)
      return render_cannot_move if moving_category?
      super
    end

    private

    def missing_visible_parent?
      return false if current_user&.staff?

      parent = Category.find_by(id: params[:parent_category_id])
      parent.nil? || !guardian.can_see_category?(parent)
    end

    def moving_category?
      return false if current_user&.staff?
      return false unless params.key?(:parent_category_id)

      params[:parent_category_id].presence&.to_i != @category.parent_category_id
    end

    def render_parent_required
      render_json_error(I18n.t("discourse_projects.errors.category_requires_parent"))
    end

    def render_cannot_move
      render_json_error(I18n.t("discourse_projects.errors.cannot_move_category"))
    end
  end
end
