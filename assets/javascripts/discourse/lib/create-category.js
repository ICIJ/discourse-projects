import { ajax } from "discourse/lib/ajax";

/**
 * Creates a category with the minimal set of fields the custom form exposes.
 * Everything else is defaulted server-side. Returns the created category.
 *
 * @param {Object} attrs
 * @param {string} attrs.name
 * @param {number} attrs.parentCategoryId
 * @param {string} [attrs.description]
 * @param {string} [attrs.color]              hex digits, no leading "#"
 * @param {number} [attrs.uploadedLogoId]
 * @param {number} [attrs.uploadedLogoDarkId]
 * @param {Object} [attrs.permissions]        { [groupName]: permissionType }
 * @param {string} [attrs.styleType]          "square" | "icon" | "emoji"
 * @param {string} [attrs.icon]               icon name when styleType is "icon"
 * @param {string} [attrs.emoji]              emoji name when styleType is "emoji"
 * @returns {Promise<Object>} the created category
 */
export default async function createCategory(attrs) {
  const data = {
    name: attrs.name,
    parent_category_id: attrs.parentCategoryId,
    description: attrs.description,
    color: attrs.color,
    uploaded_logo_id: attrs.uploadedLogoId ?? null,
    uploaded_logo_dark_id: attrs.uploadedLogoDarkId ?? null,
    permissions: attrs.permissions ?? {},
    style_type: attrs.styleType ?? "square",
    icon: attrs.icon ?? null,
    emoji: attrs.emoji ?? null,
  };

  const result = await ajax("/categories", {
    type: "POST",
    contentType: "application/json",
    data: JSON.stringify(data),
  });

  return result.category;
}
