
// TODO: Export to utils and describe the function
export const calculateEyeAspectRatio = ({ lower, upper }) => {
    // const a = calculateDistance(upper[2], lower[3]);
    // const b = calculateDistance(upper[3], lower[4]);
    const a = calculateDistance(upper[4], lower[5]);
    const b = calculateDistance(upper[2], lower[3]);
    const c = calculateDistance(lower[0], lower[lower.length - 1]);

    return ((a + b) / (2.0 * c)).toFixed(2);
}

// TODO: Export to utils and describe the function
export const calculateDistance = (point1, point2) => Math.hypot(point2[0] - point1[0], point2[1] - point1[1])

