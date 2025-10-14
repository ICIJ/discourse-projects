import { withPluginApi } from "discourse/lib/plugin-api";

/**
 * The role of this initializer is to hide the navigation menu categories
 * based on a site setting.
 */
function initialize(api) {
  const CLASS = "hide-navigation-menu-categories";
  const SITE_SETTING_NAME = "projects_hide_navigation_menu_categories";
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
  name: "hide-navigation-menu-categories",

  initialize() {
    withPluginApi(initialize);
  },
};
