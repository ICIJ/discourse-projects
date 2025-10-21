# frozen_string_literal: true
DiscourseProjects::Engine.routes.draw do
  get "/projects" => "projects#index"
  get "/projects/:slug" => "projects#show"
  get "/projects/:slug/members" => "projects#members"
end

Discourse::Application.routes.draw { mount ::DiscourseProjects::Engine, at: "/" }
