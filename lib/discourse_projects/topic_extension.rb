# frozen_string_literal: true

module DiscourseProjects
  module TopicExtension
    extend ActiveSupport::Concern

    def project
      category&.project? ? category : category&.project
    end
  end
end