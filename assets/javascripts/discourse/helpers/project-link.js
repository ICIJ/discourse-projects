import { htmlSafe } from "@ember/template";
import { categoryLinkHTML } from "discourse/helpers/category-link";
import { helperContext } from "discourse/lib/helpers";

const PROJECT_LINK_CLASS = "project-link";
const PROJECT_LINK_STYLED_CLASS = `${PROJECT_LINK_CLASS} ${PROJECT_LINK_CLASS}--styled`;

export function projectPath(project, { subcategories = false } = {}) {
  const basePath = `/c/${project.slug}/${project.id}`;
  return subcategories ? `${basePath}/subcategories` : basePath;
}

export function projectUrl(project) {
  const { siteSettings } = helperContext();
  const subcategories = siteSettings.projects_link_to_subcategories;
  return projectPath(project, { subcategories });
}

export function projectLinkHTML(project, options = {}) {
  const { siteSettings } = helperContext();
  const styled = siteSettings.projects_styled_links ?? false;
  const projectExtraClasses = styled
    ? PROJECT_LINK_STYLED_CLASS
    : PROJECT_LINK_CLASS;
  const extraClasses = `${options.extraClasses} ${projectExtraClasses}`;
  const html = categoryLinkHTML(project, { ...options, extraClasses });

  // If enabled, redirect project links to subcategories page
  if (
    siteSettings.projects_link_to_subcategories &&
    project?.slug &&
    project?.id
  ) {
    const basePath = projectPath(project);
    const htmlUnsafe = html.toString();
    // Replace only the href attribute to avoid messing with other parts of the HTML
    return htmlSafe(
      htmlUnsafe
        .split(`href="${basePath}"`)
        .join(`href="${projectUrl(project)}"`)
    );
  }

  return html;
}

export default projectLinkHTML;
