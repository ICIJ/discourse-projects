import { withPluginApi } from "discourse/lib/plugin-api";

function initialize(api) {
  api.registerConnectorClass("above-main-container", "project-banner", {
    pluginId: "setup-project-banner",
    services: ["project"],

    setupComponent(_args, component) {
      const { siteSettings } = component.site;
      const position = siteSettings.projects_banner_sticky
        ? "sticky"
        : "static";
      this.set("classNames", [`project-banner--${position}`]);
    },

    shouldRender(_args, component) {
      return component.siteSettings.projects_banner;
    },
  });
}

export default {
  name: "setup-project-banner",
  initialize() {
    withPluginApi("1.8.0", initialize);
  },
};
