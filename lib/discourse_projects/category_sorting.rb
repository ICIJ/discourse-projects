# frozen_string_literal: true

module DiscourseProjects
  module CategorySorting
    def self.register(plugin)
      # Sort categories in Site cache (global category list)
      plugin.register_modifier(:site_all_categories_cache_query) do |query|
        if SiteSetting.projects_sort_categories_alphabetically
          query.reorder(Category.arel_table[:name].lower.asc)
        else
          query
        end
      end

      # Sort categories in CategoryList (used by /categories and /c/*/subcategories pages)
      plugin.register_modifier(:category_list_find_categories_query) do |query, category_list|
        options = category_list&.instance_variable_get(:@options) || {}
        is_top_level = options[:parent_category_id].blank?

        # Show only direct children of projects (level 1) on /categories page
        if SiteSetting.projects_hide_projects_from_categories_page && is_top_level
          # Build a pure Arel subquery to get project IDs without instantiating Category objects
          # This avoids HasCustomFields::NotPreloadedError from other plugins
          categories = Category.arel_table
          project_ids_subquery = categories.project(categories[:id])
            .where(categories[:parent_category_id].eq(nil))
            .where(categories[:id].not_eq(SiteSetting.uncategorized_category_id))

          if SiteSetting.projects_private?
            project_ids_subquery = project_ids_subquery.where(categories[:read_restricted].eq(true))
          end

          # Use unscope(:where) and rewhere to replace the parent_category_id condition
          # while preserving all other query setup (includes, preloads, etc.)
          # Re-apply secured() to maintain permission checks
          guardian = category_list.instance_variable_get(:@guardian)
          query = query.unscope(:where).secured(guardian).where(
            categories[:parent_category_id].in(project_ids_subquery)
          )
        end

        if SiteSetting.projects_sort_categories_alphabetically
          query = query.reorder(Category.arel_table[:name].lower.asc)
        end

        query
      end
    end
  end
end
