import { apiInitializer } from "discourse/lib/api";
import ProjectDropdownBreadcrumb from "../components/project-dropdown-breadcrumb";

export default apiInitializer((api) => {
  const siteSettings = api.container.lookup("service:site-settings");

  if (siteSettings.projects_breadcrumb_project_dropdown) {
    // Add body class to enable CSS rules for hiding core category dropdowns
    document.body.classList.add("breadcrumb-project-dropdown");

    // Render the project dropdown in the breadcrumbs
    api.renderInOutlet("bread-crumbs-left", ProjectDropdownBreadcrumb);
  }
});
