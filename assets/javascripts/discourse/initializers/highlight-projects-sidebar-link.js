import { withPluginApi } from "discourse/lib/plugin-api";

/**
 * The role of this initializer is to highlight the projects sidebar link
 * based on a site setting.
 */
function initialize(api) {
  const CLASS = "highlight-projects-sidebar-link";
  const SITE_SETTING_NAME = "projects_highlight_projects_sidebar_link";
  const { [SITE_SETTING_NAME]: toggle } = api.container.lookup(
    "service:site-settings"
  );
  const applyClass = () => document.body.classList.toggle(CLASS, toggle);
  // Apply on boot
  applyClass();
  // Also re-apply on page changes (cheap + resilient)
  api.onPageChange(applyClass);
}

export default {
  name: "highlight-projects-sidebar-link",

  initialize() {
    withPluginApi(initialize);
  },
};
