# frozen_string_literal: true

module ::DiscourseProjects
  class ProjectsController < ::ApplicationController
    requires_plugin PLUGIN_NAME

    def index
      render_serialized(projects, DiscourseProjects::ProjectSerializer, root: "projects")
    end

    private

    def projects
      Category.secured(guardian).select{ |category| category.project? }
    end
  end
end