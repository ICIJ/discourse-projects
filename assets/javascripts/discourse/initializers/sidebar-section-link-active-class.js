import { withPluginApi } from "discourse/lib/plugin-api"

/**
 * The role of this initializer is to add an "active" class to the sidebar section link
 * when the current page matches the link's href. In theory this could be handled by Discourse core,
 * but as of now it does not for custom links, so we implement it here.
 * 
 * @see https://meta.discourse.org/t/active-state-not-working-for-added-links-in-the-sidebar-component/323422
 */
function initialize(api) {
  // Selector for sidebar section links that are not Ember views. It looks
  // like Ember views get their own active state handling as opposed to custom links.
  const LINK_SELECTOR = ".sidebar-section-link:not(.ember-view)"
  const CLASS_ACTIVE = "active"
  const applyClass = () => {
    document.querySelectorAll(LINK_SELECTOR).forEach((link) => {
      const href = link.getAttribute("href")
      const toggle = window.location.pathname === href
      link.classList.toggle(CLASS_ACTIVE, toggle)
    })
  }
  // Apply once
  applyClass()
  // Also re-apply on page changes (cheap + resilient)
  api.onPageChange(applyClass)
}

export default {
  name: "sidebar-section-link-active-class",

  initialize() {
    withPluginApi(initialize)
  },
}
