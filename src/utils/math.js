
// TODO: Export to utils and describe the function
export const calculateEyeAspectRatio = ({ edgeL, edgeR, upperL, upperR, lowerL, lowerR}) => {
    const a = calculateDistance(upperR, lowerR]);
    const b = calculateDistance(upperL, lowerL);
    const c = calculateDistance(edgeL, edgeR);

    return ((a + b) / (2.0 * c)).toFixed(2);
}

// TODO: Export to utils and describe the function
export const calculateDistance = (point1, point2) => Math.hypot(point2[0] - point1[0], point2[1] - point1[1])

