/**
 * Checks if a number is within a specified range.
 *
 * @param {number} number - The number to check.
 * @param {number} start - The start of the range, inclusive.
 * @param {number} end - The end of the range, inclusive.
 * @returns {boolean} - True if the number is within the range, false otherwise.
 */
export default function inRange(number, start, end) {
  return number >= start && number <= end;
}
