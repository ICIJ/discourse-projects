import { apiInitializer } from "discourse/lib/api";
import SubcategoryBreadcrumbLink from "../components/subcategory-breadcrumb-link";

export default apiInitializer((api) => {
  const siteSettings = api.container.lookup("service:site-settings");

  if (siteSettings.projects_breadcrumb_subcategory_links) {
    // Add body class to enable CSS rules for subcategory links
    document.body.classList.add("breadcrumb-subcategory-links");

    // Render subcategory links in the bread-crumbs-right outlet
    // CSS will reorder them to appear after the project dropdown
    api.renderInOutlet("bread-crumbs-right", SubcategoryBreadcrumbLink);
  }
});
