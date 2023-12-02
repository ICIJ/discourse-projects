/**
 * Creates a function that accepts up to n arguments, ignoring any additional arguments.
 *
 * @param {Function} func - The function to cap the number of arguments for.
 * @param {number} n - The arity cap. The number of arguments the new function will accept. Default to func.length.
 * @returns {Function} - The new function with an arity of n.
 */
export default function ary(func, n) {
  return function (...args) {
    return func(...args.slice(0, n ?? func.length));
  };
}
