import { ajax } from "discourse/lib/ajax";

/**
 * Fetches a category's group permissions in the shape the create endpoint
 * expects: { [groupName]: permissionType }. A new subcategory inherits its
 * parent project's permissions so subcategories of a private project stay
 * private.
 *
 * @param {number} categoryId
 * @returns {Promise<Object>}
 */
export default async function fetchCategoryPermissions(categoryId) {
  const { category } = await ajax(`/c/${categoryId}/show.json`);
  const permissions = {};
  (category.group_permissions || []).forEach((p) => {
    permissions[p.group_name] = p.permission_type;
  });
  return permissions;
}
