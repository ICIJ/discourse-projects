# frozen_string_literal: true

module DiscourseProjects
  module ApplicationLayoutPreloaderExtension
    def preload_anonymous_data
      super
      @preloaded["projects"] = fetch_projects_json
    end

    def fetch_projects
      Category.secured(@guardian).projects
    end

    def fetch_projects_json
      serializer = ActiveModel::ArraySerializer.new(fetch_projects, each_serializer: DiscourseProjects::ProjectSerializer)
      MultiJson.dump(serializer)
    end
  end
end