/**
 * Trims specified characters from both ends of a string. If no specific characters are
 * provided, it trims whitespace by default.
 *
 * @param {string} str - The string to trim.
 * @param {string} chars - The characters to trim, defaults to a space (whitespace).
 * @returns {string} - The trimmed string.
 */
export default function trim(str, chars = " ") {
  const escapeRegExp = (s = "") => s.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
  const regExp = new RegExp(
    `^[${escapeRegExp(chars)}]+|[${escapeRegExp(chars)}]+$`,
    "g"
  );
  return str.replace(regExp, "");
}
