# frozen_string_literal: true

module DiscourseProjects
  # Extends the Category model to support the "project"
  # concept within discourse.
  module CategoryExtension
    extend ActiveSupport::Concern

    prepended do
      scope :categorized, -> {
        where.not(id: SiteSetting.uncategorized_category_id)
      }

      scope :projects, -> {
        scope = where(parent_category: [nil, ''])
        scope = scope.where(read_restricted: true) if SiteSetting.projects_private?
        scope.categorized
      }

      # A category must belong to a project (have a parent) unless it is itself
      # a project. Enforced on every save (create and edit), so the rule can't
      # be sidestepped via the edit form or the API. Gated by a site setting.
      validate :must_belong_to_a_project,
               if: -> { SiteSetting.projects_category_requires_parent }
    end

    # A category must keep a project as its parent. Rejected when:
    #   - it has no parent and isn't a (genuine) project, or
    #   - an existing parent is being removed — detaching a child would turn it
    #     into a top-level category, which `project?` would wrongly accept for a
    #     read-restricted child.
    # The uncategorized catch-all is exempt.
    def must_belong_to_a_project
      return unless is_categorized
      return if parent_category_id.present?

      detaching_existing_parent = parent_category_id_was.present?
      return if !detaching_existing_parent && project?

      errors.add(:base, I18n.t("discourse_projects.errors.category_requires_parent"))
    end

    def ancestors
      query = <<~SQL
        WITH RECURSIVE ancestors AS (
          SELECT id, parent_category_id
          FROM #{self.class.table_name}
          WHERE id = #{id}
          UNION
            SELECT c.id, c.parent_category_id
            FROM #{self.class.table_name} c
            JOIN ancestors p ON p.parent_category_id = c.id
        ) SELECT id FROM ancestors WHERE id != #{id};
      SQL
      ancestors_ids = self.class.find_by_sql(query).map(&:id)
      self.class.where(id: ancestors_ids)
    end

    def is_categorized
      id != SiteSetting.uncategorized_category_id
    end

    def project
      return nil if project?
      # To find the category's project we look for the first ancestor that is a project.
      # We first use the "ancestors" method to get all ancestors, then we filter them
      # with the "projects" scope to only get ancestors that are projects.
      ancestors.projects.first
    end

    # A project is a category which does not have a parent.
    # If `SiteSetting.projects_private?` is true, it also means the category
    # must be private (read_restricted).
    def project?
      (!SiteSetting.projects_private? or read_restricted) and parent_category.blank? and is_categorized
    end
  end
end
