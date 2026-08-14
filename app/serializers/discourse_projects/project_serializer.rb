# frozen_string_literal: true
class DiscourseProjects::ProjectSerializer < CategoryDetailedSerializer
  # Core serializes some categories without a scope (search results' lazy-loaded
  # categories, chat channels), and CategoryDetailedSerializer needs one to count
  # visible subcategories. Fall back to the anonymous guardian instead of blowing up.
  def scope
    super || Guardian.new
  end
end
