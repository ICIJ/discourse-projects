/**
 * Gets the value at path of object. If the resolved value is undefined, the defaultValue is returned in its place.
 * @param {Object} object - The object to query.
 * @param {string} path - The path of the property to get, in dot notation.
 * @param {*} [defaultValue] - The value returned for undefined resolved values.
 * @returns {*} - Returns the resolved value.
 */
export default function retrieve(object, path, defaultValue = undefined) {
  // Split the path into keys and reduce the object
  return path
    .split(".")
    .reduce(
      (o, key) => (o && o[key] !== undefined ? o[key] : defaultValue),
      object
    );
}
