# frozen_string_literal: true

module ::DiscourseProjects
  class ProjectsController < ::ApplicationController
    requires_plugin DiscourseProjects::PLUGIN_NAME

    def index
      discourse_expires_in 1.minute

      render_serialized(projects, DiscourseProjects::ProjectSerializer, root: "projects")
    end

    private

    def projects
      Category.secured(guardian).projects
    end
  end
end