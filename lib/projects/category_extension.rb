# frozen_string_literal: true

module Projects
  # Extends the Category model to support the "project"
  # concept within discourse.
  module CategoryExtension
    extend ActiveSupport::Concern

    # rubocop:disable Metrics/MethodLength
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
    # rubocop:enable Metrics/MethodLength

    def project
      ancestors.select(&:project?).first
    end

    def project?
      read_restricted and parent_category.blank?
    end
  end
end
