import { apiInitializer } from "discourse/lib/api";
import BreadcrumbChain from "../components/breadcrumb-chain";

export default apiInitializer((api) => {
  const siteSettings = api.container.lookup("service:site-settings");

  if (!siteSettings.projects_breadcrumb_project_dropdown) {
    return;
  }

  // Body classes gate the CSS that hides core's own breadcrumb cells.
  document.body.classList.add("breadcrumb-project-dropdown");

  if (siteSettings.projects_breadcrumb_subcategory_links) {
    document.body.classList.add("breadcrumb-subcategory-links");
  }

  api.renderInOutlet("bread-crumbs-left", BreadcrumbChain);
});
