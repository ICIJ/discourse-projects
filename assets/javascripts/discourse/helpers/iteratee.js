import retrieve from "./retrieve";

/**
 * Creates a function that invokes the method at a given path of each element in a collection.
 * - If `arg` is a function, it returns the function itself.
 * - If `arg` is a string, it returns a function that will return the value of the property with that name from its parameter.
 * - If `arg` is an array, it returns a function that will act as a property matcher.
 * - If `arg` is an object, it returns a function that will act as an object matcher.
 * @param {*} arg - The argument to transform into an iteratee function.
 * @returns {Function} The iteratee function.
 */
export default function iteratee(arg) {
  if (typeof arg === "function") {
    return arg;
  }
  if (typeof arg === "string") {
    return (obj) => retrieve(obj, arg);
  }
  if (Array.isArray(arg)) {
    return (obj) => arg.every((key) => retrieve(obj, key) === arg[key]);
  }
  if (typeof arg === "object") {
    return (obj) =>
      Object.keys(arg).every((key) => retrieve(obj, key) === arg[key]);
  }
}
