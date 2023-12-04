import { categoryLinkHTML } from "discourse/helpers/category-link";
import { registerUnbound } from "discourse-common/lib/helpers";

export function projectLinkHTML(project, options = {}) {
  const { extraClasses = '' } = options;
  const projectExtraClasses = 'project-link';
  return categoryLinkHTML(project, { ...options, extraClasses: [extraClasses, projectExtraClasses].join(' ') });
}

registerUnbound("project-link", projectLinkHTML);