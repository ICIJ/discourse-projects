# frozen_string_literal: true

module DiscourseProjects
  module CategorySorting
    def self.register(plugin)
      # Sort categories in Site cache (global category list)
      plugin.register_modifier(:site_all_categories_cache_query) do |query|
        if SiteSetting.projects_sort_categories_alphabetically
          query.reorder("LOWER(categories.name) ASC")
        else
          query
        end
      end

      # Sort categories in CategoryList (used by /categories and /c/*/subcategories pages)
      plugin.register_modifier(:category_list_find_categories_query) do |query|
        if SiteSetting.projects_sort_categories_alphabetically
          query.reorder("LOWER(categories.name) ASC")
        else
          query
        end
      end
    end
  end
end
