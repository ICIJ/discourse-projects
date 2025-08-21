/**
 * Extracts consonants from a given string.
 *
 * @param {string} value - The input string.
 * @returns {Array<string>} - An array of consonants found in the input string.
 */
function consonants(value = "") {
  const vowels = ["a", "e", "i", "o", "u", "y"];
  const result = [];

  for (const v of value) {
    const char = v.toLowerCase();
    // Check if the character is an alphabet and not a vowel
    if (/^[a-z]$/.test(char) && !vowels.includes(char)) {
      // Push the original value to keep the case
      result.push(v);
    }
  }

  return result;
}

/**
 * Generates an abbreviation from a given name. This function also
 * ignores non-alphabetic characters.
 *
 * @param {string} name - The name to generate an abbreviation from.
 * @returns {string} - The generated abbreviation.
 */
export default function abbr(name) {
  const slugName = name.replace(/[^a-zA-Z]/g, "");
  const start = slugName.slice(0, 1);
  const end = slugName.slice(-1);
  const middleConsonants = consonants(slugName.slice(1, -1));
  const middle = middleConsonants[Math.floor(middleConsonants.length / 2)];
  return [start, middle, end].filter(Boolean).join("").toUpperCase();
}
