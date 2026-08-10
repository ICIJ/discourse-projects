import { ajax } from "discourse/lib/ajax";

/**
 * Updates the fields the custom category form exposes in edit mode.
 *
 * Only these keys are sent. `categories#update` runs `cat.update(category_params)`
 * with no `params.require` (that lives in `required_create_params`, which only
 * `create` uses), so attributes we omit — permissions and parent included — are
 * left untouched. The form deliberately cannot move a category between
 * projects, so `parent_category_id` is never part of the payload.
 *
 * @param {number} id
 * @param {Object} attrs
 * @param {string} attrs.name
 * @param {string} [attrs.color]              hex digits, no leading "#"
 * @param {number} [attrs.uploadedLogoId]
 * @param {number} [attrs.uploadedLogoDarkId]
 * @returns {Promise<Object>} the updated category
 */
export default async function updateCategory(id, attrs) {
  const data = {
    name: attrs.name,
    color: attrs.color,
    uploaded_logo_id: attrs.uploadedLogoId ?? null,
    uploaded_logo_dark_id: attrs.uploadedLogoDarkId ?? null,
  };

  const result = await ajax(`/categories/${id}`, {
    type: "PUT",
    contentType: "application/json",
    data: JSON.stringify(data),
  });

  return result.category;
}
