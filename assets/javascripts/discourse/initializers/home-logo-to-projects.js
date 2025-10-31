import { withPluginApi } from "discourse/lib/plugin-api"

/** 
 * The role of this initializer is to change the homepage 
 * logo link to point to /projects when the site setting is enabled.
 */
function initialize(api) {
  const SITE_SETTING_NAME = "projects_home_logo_to_projects"
  const { [SITE_SETTING_NAME]: toggle } = api.container.lookup("service:site-settings")
  api.registerHomeLogoHrefCallback(() => toggle ? '/projects' : '/')
}

export default {
  name: "home-logo-to-projects",

  initialize() {
    withPluginApi(initialize)
  },
}
