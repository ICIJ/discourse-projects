# frozen_string_literal: true

# name: discourse-projects
# about: A plugin for using groups to separate and organize categories and topics.
# authors: ICIJ <engineering@icij.org>
# url: https://github.com/ICIJ/discourse-projects
# required_version: 3.4.0


enabled_site_setting :projects_enabled

register_asset 'stylesheets/common/index.scss'

module ::DiscourseProjects
  PLUGIN_NAME = "discourse-projects".freeze
end

require_relative 'lib/engine'

after_initialize do
  DiscourseProjects::CategorySorting.register(self)
  DiscourseProjects::CategoryLatestFiltering.register(self)

  Discourse::Application.routes.prepend do
    get '/new-subcategory/:parent' => 'categories#show', :constraints => { format: 'html' }, as: "subcategory_new"
    get '/c/*category_slug/categories' => "categories#find_by_slug", :constraints => { format: 'html' }, as: "subcategories_index"
    get '/c/*category_slug/members' => "categories#find_by_slug", :constraints => { format: 'html' }, as: "members_index"
  end

  reloadable_patch do
    ApplicationLayoutPreloader.prepend DiscourseProjects::ApplicationLayoutPreloaderExtension
    Category.prepend DiscourseProjects::CategoryExtension
    Topic.prepend DiscourseProjects::TopicExtension
  end

  add_to_serializer(:current_user, :can_create_category) do
    Guardian.new(scope.user).can_create_category?
  end

  add_to_serializer(:basic_category, :is_project) do
    object.project?
  end

  add_to_serializer(:basic_category, :project) do
    DiscourseProjects::ProjectSerializer.new object.project, root: false
  end

  add_to_serializer(:topic_list_item, :project) do
    DiscourseProjects::ProjectSerializer.new object.project, root: false
  end
end
