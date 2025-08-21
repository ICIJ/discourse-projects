import abbr from "./abbr";

/**
 * Generates a placeholder logo for a category.
 *
 * @param {string} text - The text to display in the logo.
 * @param {string} color - The background color of the logo in hex format.
 * @param {string} textColor - The color of the text in hex format.
 * @param {number} width - The width of the logo in pixels.
 * @param {number} height - The height of the logo in pixels.
 *
 * @returns {string} - An SVG string representing the placeholder logo.
 */
export default function categoryPlaceholderLogo(
  text = "",
  color,
  textColor = "white",
  width = 60,
  height = 60
) {
  return `
    <svg xmlns="http://www.w3.org/2000/svg" height="${height}" width="${width}">
      <style>
        text {
          font-weight: 600;
          font-family: "Poppins", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        }
      </style>
      <rect width="100%" height="100%" fill="#${color}" />
      <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="20" fill="#${textColor}">
        ${abbr(text)}
      </text>
    </svg>
  `;
}
