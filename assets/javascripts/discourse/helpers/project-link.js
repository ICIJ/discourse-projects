import { categoryLinkHTML } from "discourse/helpers/category-link";

export function projectLinkHTML(project, options = {}) {
  const { extraClasses = "" } = options;
  const projectExtraClasses = "project-link";
  return categoryLinkHTML(project, {
    ...options,
    extraClasses: `${extraClasses} ${projectExtraClasses}`,
  });
}

export default projectLinkHTML;
