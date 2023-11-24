/**
 * Filters an array of objects based on a unique key or the result of a function.
 * @param {Array} arr - The array to filter.
 * @param {Function} fn - A function that takes an item from the array and returns the value to use for uniqueness.
 * @returns {Array} A new array with only unique items.
 */
export default function uniqueBy(arr, fn) {
  const seen = new Map();
  return arr.filter((item) => {
    const keyValue = fn(item);
    return seen.has(keyValue) ? false : seen.set(keyValue, true);
  });
}
