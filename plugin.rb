# name: projects
# about: A plugin for using groups to separate and organize categories and topics.
# version: 0.0.0
# authors: ICIJ <engineering@icij.org>
# required_version: 3.4.0


enabled_site_setting :projects_enabled

after_initialize do
  Discourse::Application.routes.append do
    get "/new-subcategory/:parent" => "categories#show", :constraints => { format: "html" }
  end
  
  add_to_serializer(:current_user, :can_create_category) do 
    guardian = Guardian.new(scope.user)
    guardian.is_admin? || (SiteSetting.moderators_manage_categories_and_groups && guardian.is_moderator?)
  end
end
