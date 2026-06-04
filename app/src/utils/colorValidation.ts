/**
 * Color Validation Utility
 * 
 * Validates that a color value is a safe CSS color string.
 * Prevents CSS injection via malicious color values.
 * 
 * @module colorValidation
 */

/**
 * List of CSS named colors (subset of most commonly used)
 */
const NAMED_COLORS = new Set([
  // CSS-wide keywords
  'transparent', 'currentcolor', 'inherit', 'initial', 'unset',
  // Basic colors
  'aliceblue', 'antiquewhite', 'aqua', 'aquamarine', 'azure',
  'beige', 'bisque', 'black', 'blanchedalmond', 'blue', 'blueviolet',
  'brown', 'burlywood', 'cadetblue', 'chartreuse', 'chocolate',
  'coral', 'cornflowerblue', 'cornsilk', 'crimson', 'cyan',
  'darkblue', 'darkcyan', 'darkgoldenrod', 'darkgray', 'darkgreen',
  'darkgrey', 'darkkhaki', 'darkmagenta', 'darkolivegreen', 'darkorange',
  'darkorchid', 'darkred', 'darksalmon', 'darkseagreen', 'darkslateblue',
  'darkslategray', 'darkslategrey', 'darkturquoise', 'darkviolet',
  'deeppink', 'deepskyblue', 'dimgray', 'dimgrey', 'dodgerblue',
  'firebrick', 'floralwhite', 'forestgreen', 'fuchsia', 'gainsboro',
  'ghostwhite', 'gold', 'goldenrod', 'gray', 'green', 'greenyellow',
  'grey', 'honeydew', 'hotpink', 'indianred', 'indigo', 'ivory',
  'khaki', 'lavender', 'lavenderblush', 'lawngreen', 'lemonchiffon',
  'lightblue', 'lightcoral', 'lightcyan', 'lightgoldenrodyellow',
  'lightgray', 'lightgreen', 'lightgrey', 'lightpink', 'lightsalmon',
  'lightseagreen', 'lightskyblue', 'lightslategray', 'lightslategrey',
  'lightsteelblue', 'lightyellow', 'lime', 'limegreen', 'linen',
  'magenta', 'maroon', 'mediumaquamarine', 'mediumblue', 'mediumorchid',
  'mediumpurple', 'mediumseagreen', 'mediumslateblue', 'mediumspringgreen',
  'mediumturquoise', 'mediumvioletred', 'midnightblue', 'mintcream',
  'mistyrose', 'moccasin', 'navajowhite', 'navy', 'oldlace',
  'olive', 'olivedrab', 'orange', 'orangered', 'orchid',
  'palegoldenrod', 'palegreen', 'paleturquoise', 'palevioletred',
  'papayawhip', 'peachpuff', 'peru', 'pink', 'plum',
  'powderblue', 'purple', 'rebeccapurple', 'red', 'rosybrown',
  'royalblue', 'saddlebrown', 'salmon', 'sandybrown', 'seagreen',
  'seashell', 'sienna', 'silver', 'skyblue', 'slateblue',
  'slategray', 'slategrey', 'snow', 'springgreen', 'steelblue',
  'tan', 'teal', 'thistle', 'tomato', 'turquoise', 'violet',
  'wheat', 'white', 'whitesmoke', 'yellow', 'yellowgreen',
]);

/**
 * Validates that a color value is a safe CSS color string.
 * Prevents CSS injection via malicious color values.
 * 
 * @param color - The color string to validate
 * @returns true if the color is a valid CSS color, false otherwise
 * 
 * @example
 *   isValidColor('#FF0000')  // true
 *   isValidColor('rgb(255, 0, 0)')  // true
 *   isValidColor('javascript:alert(1)')  // false
 */
export function isValidColor(color: string | null | undefined): boolean {
  if (color === null || color === undefined || typeof color !== 'string') {
    return false;
  }

  // Trim whitespace
  const trimmed = color.trim();
  if (trimmed.length === 0) {
    return false;
  }

  // Reject colors that contain dangerous patterns
  // CSS injection typically uses semicolons with JS functions or url()
  if (/[;()]/.test(trimmed) && /javascript|expression|url|eval/i.test(trimmed)) {
    return false;
  }

  // Allow hex colors (#RGB, #RRGGBB, #RRGGBBAA)
  if (/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/.test(trimmed)) {
    return true;
  }

  // Allow rgb/rgba colors
  if (/^rgba?\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*(,\s*(0?\.\d+|1(\.0+)?|\d{1,3}%)\s*)?\)$/.test(trimmed)) {
    return true;
  }

  // Allow hsl/hsla colors
  if (/^hsla?\(\s*\d{1,3}\s*,\s*\d{1,3}%\s*,\s*\d{1,3}%\s*(,\s*(0?\.\d+|1(\.0+)?|\d{1,3}%)\s*)?\)$/.test(trimmed)) {
    return true;
  }

  // Allow named CSS colors (case-insensitive)
  if (NAMED_COLORS.has(trimmed.toLowerCase())) {
    return true;
  }

  // Reject anything else
  return false;
}
