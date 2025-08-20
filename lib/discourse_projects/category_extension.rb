# frozen_string_literal: true

module DiscourseProjects
  # Extends the Category model to support the "project"
  # concept within discourse.
  module CategoryExtension
    extend ActiveSupport::Concern

    prepended do
      scope :projects, -> { 
        scope = where(parent_category: [nil, ''])
        scope = scope.where(read_restricted: true) if SiteSetting.projects_private?
        scope
      }
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
      (!SiteSetting.projects_private? or read_restricted) and parent_category.blank?
    end
  end
end
