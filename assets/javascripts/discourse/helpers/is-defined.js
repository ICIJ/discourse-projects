/**
 * Return true if the given value is defined.
 * @param {*} value - The value to check.
 * @returns {Boolean}
 */
export default function isDefined(value) {
  return value !== null && typeof value !== "undefined";
}
