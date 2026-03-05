# frozen_string_literal: true

module DiscourseProjects
  module TopicExtension
    extend ActiveSupport::Concern

    prepended do
      validate :topic_not_in_project_category, on: :create
    end

    def project
      category&.project? ? category : category&.project
    end

    private

    def topic_not_in_project_category
      return unless category&.project?
      return unless SiteSetting.projects_enabled
      return unless SiteSetting.projects_composer_project_chooser

      errors.add(:base, I18n.t("discourse_projects.errors.topic_in_project_category"))
    end
  end
end