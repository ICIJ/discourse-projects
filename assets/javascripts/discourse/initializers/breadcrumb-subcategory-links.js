import { withPluginApi } from "discourse/lib/plugin-api";

/**
 * The role of this initializer is to add a body class when the
 * breadcrumb subcategory links setting is enabled.
 */
function initialize(api) {
  const CLASS = "breadcrumb-subcategory-links";
  const SITE_SETTING_NAME = "projects_breadcrumb_subcategory_links";
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
  name: "breadcrumb-subcategory-links",

  initialize() {
    withPluginApi(initialize);
  },
};
