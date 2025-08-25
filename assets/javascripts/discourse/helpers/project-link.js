import { categoryLinkHTML } from "discourse/helpers/category-link";
import { helperContext } from "discourse/lib/helpers";

const PROJECT_LINK_CLASS = "project-link";
const PROJECT_LINK_STYLED_CLASS = `${PROJECT_LINK_CLASS} ${PROJECT_LINK_CLASS}--styled`;

export function projectLinkHTML(project, options = {}) {
  const { siteSettings } = helperContext();
  const styled = siteSettings.projects_styled_links ?? false;
  const projectExtraClasses = styled
    ? PROJECT_LINK_STYLED_CLASS
    : PROJECT_LINK_CLASS;
  const extraClasses = `${options.extraClasses} ${projectExtraClasses}`;
  return categoryLinkHTML(project, { ...options, extraClasses });
}

export default projectLinkHTML;
