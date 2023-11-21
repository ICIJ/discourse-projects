module ::Projects
  class Engine < ::Rails::Engine
    engine_name PLUGIN_NAME
    isolate_namespace Projects
    config.autoload_paths << File.join(config.root, "lib")
  end
end
