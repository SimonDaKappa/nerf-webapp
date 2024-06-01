function rgbToNearestCommonColor(r, g, b) {
  const commonColors = {
    red: [1, 0, 0],
    green: [0, 1, 0],
    blue: [0, 0, 1],
    yellow: [1, 1, 0],
    cyan: [0, 1, 1],
    magenta: [1, 0, 1],
    black: [0, 0, 0],
    white: [1, 1, 1],
    gray: [0.5, 0.5, 0.5],
    orange: [1, 0.5, 0],
    purple: [0.5, 0, 0.5],
    brown: [0.6, 0.4, 0.2],
    pink: [1, 0.75, 0.8],
    lime: [0.75, 1, 0],
    teal: [0, 0.5, 0.5],
    indigo: [0.29, 0, 0.51],
    violet: [0.93, 0.51, 0.93],
    turquoise: [0.25, 0.88, 0.82],
    gold: [1, 0.84, 0],
    silver: [0.75, 0.75, 0.75],
  };

  let minDistance = Infinity;
  let nearestColor = null;

  for (const [colorName, rgbValues] of Object.entries(commonColors)) {
    const [r2, g2, b2] = rgbValues;
    const distance = Math.sqrt((r - r2) ** 2 + (g - g2) ** 2 + (b - b2) ** 2);

    if (distance < minDistance) {
      minDistance = distance;
      nearestColor = colorName;
    }
  }

  return nearestColor;
}

export { rgbToNearestCommonColor };