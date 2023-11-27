/**
 * Creates a function that performs a partial deep comparison between a given object and the source object.
 * This function is useful for matching objects in an array based on certain criteria.
 *
 * @param {Object} source - The source object containing the key-value pairs to match against.
 * @returns {Function} - A function that accepts an object to compare against the source object.
 */
export default function matches(source) {
  return function (obj) {
    for (let key in source) {
      if (source.hasOwnProperty(key)) {
        if (obj[key] !== source[key]) {
          return false;
        }
      }
    }
    return true;
  };
}
