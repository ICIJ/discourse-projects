# frozen_string_literal: true

module ::DiscourseProjects
  # This engine regroups all extensions made to support
  # the concept of "project" within Discourse.
  class Engine < ::Rails::Engine
    engine_name PLUGIN_NAME
    isolate_namespace Projects
    config.autoload_paths << File.join(config.root, 'lib')
  end
end
