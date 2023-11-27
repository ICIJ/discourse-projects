import isUndefined from "./is-undefined";

/**
 * Return true if the given value is undefined, null r an empty string.
 * @param {*} value - The value to check.
 * @returns {Boolean}
 */
export default function isBlank(value) {
  return isUndefined(value) || value === null || value === "";
}
