# frozen_string_literal: true
DiscourseProjects::Engine.routes.draw do
  get "/projects" => "projects#index"
end

Discourse::Application.routes.draw { mount ::DiscourseProjects::Engine, at: "/" }
