# frozen_string_literal: true

# name: discourse-projects
# about: A plugin for using groups to separate and organize categories and topics.
# version: 0.0.0
# authors: ICIJ <engineering@icij.org>
# required_version: 3.4.0


enabled_site_setting :projects_enabled

register_asset 'stylesheets/common/index.scss'

module ::DiscourseProjects
  PLUGIN_NAME = 'discourse-projects'
end

require_relative 'lib/projects/engine'

after_initialize do
  Discourse::Application.routes.append do
    get '/new-subcategory/:parent' => 'categories#show', :constraints => { format: 'html' }, as: "subcategory_new"
    get '/categories/:parent' => 'categories#show', :constraints => { format: 'html' }, as: "subcategories_index"
    get '/projects' => 'categories#index', :constraints => { format: 'html' }
  end

  reloadable_patch do |_plugin|
    Category.prepend Projects::CategoryExtension
  end

  add_to_serializer(:current_user, :can_create_category) do
    guardian = Guardian.new(scope.user)
    guardian.is_admin? || (SiteSetting.moderators_manage_categories_and_groups && guardian.is_moderator?)
  end

  add_to_serializer(:basic_category, :is_project) do
    object.project?
  end

  add_to_serializer(:basic_category, :project) do
    object.project
  end
end
