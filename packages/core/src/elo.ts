// FIDE table from https://handbook.fide.com/chapter/B11FOARatingRegulations
const eTable = [
    [0, 3, 0.5, 0.5],
    [4, 10, 0.51, 0.49],
    [11, 17, 0.52, 0.48],
    [18, 25, 0.53, 0.47],
    [26, 32, 0.54, 0.46],
    [33, 39, 0.55, 0.45],
    [40, 46, 0.56, 0.44],
    [47, 53, 0.57, 0.43],
    [54, 61, 0.58, 0.42],
    [62, 68, 0.59, 0.41],
    [69, 76, 0.6, 0.4],
    [77, 83, 0.61, 0.39],
    [84, 91, 0.62, 0.38],
    [92, 98, 0.63, 0.37],
    [99, 106, 0.64, 0.36],
    [107, 113, 0.65, 0.35],
    [114, 121, 0.66, 0.34],
    [122, 129, 0.67, 0.33],
    [130, 137, 0.68, 0.32],
    [138, 145, 0.69, 0.31],
    [146, 153, 0.7, 0.3],
    [154, 162, 0.71, 0.29],
    [163, 170, 0.72, 0.28],
    [171, 179, 0.73, 0.27],
    [180, 188, 0.74, 0.26],
    [189, 197, 0.75, 0.25],
    [198, 206, 0.76, 0.24],
    [207, 215, 0.77, 0.23],
    [216, 225, 0.78, 0.22],
    [226, 235, 0.79, 0.21],
    [236, 245, 0.8, 0.2],
    [246, 256, 0.81, 0.19],
    [257, 267, 0.82, 0.18],
    [268, 278, 0.83, 0.17],
    [279, 290, 0.84, 0.16],
    [291, 302, 0.85, 0.15],
    [303, 315, 0.86, 0.14],
    [316, 328, 0.87, 0.13],
    [329, 344, 0.88, 0.12],
    [345, 357, 0.89, 0.11],
    [358, 374, 0.9, 0.1],
    [375, 391, 0.91, 0.09],
    [392, 411, 0.92, 0.08],
    [412, 432, 0.93, 0.07],
    [433, 456, 0.94, 0.06],
    [457, 484, 0.95, 0.05],
    [485, 517, 0.96, 0.04],
    [518, 559, 0.97, 0.03],
    [560, 619, 0.98, 0.02],
    [620, 735, 0.99, 0.01],
    [735, Number.MAX_VALUE, 1.0, 0.0],
] as const;

const findE = (rating: number, opponent: number): number => {
    const ratingDiff = rating - opponent;

    // absolute of difference for lookup
    const diff = Math.abs(Math.round(ratingDiff));

    // find the correct row in the E table
    for (const [from, to, high, low] of eTable) {
        if (diff >= from && diff <= to) {
            return ratingDiff > 0 ? high : low;
        }
    }
    // this should never happen, because upper bound is Number.MAX_VALUE
    return ratingDiff >= 0 ? 1 : 0;
};

export const getRatingDelta = (
    rating: number,
    opponentRating: number,
    result: 1 | 0 | 0.5,
    k: number,
): number => {
    // this is the formula, but FIDE uses an adjusted table with slightly different distribution
    // const expected = 1 / (1 + 10 ** ((opponentRating - rating) / 400));

    // lookup FIDE expected odds
    const expected = findE(rating, opponentRating);

    // calculate delta
    const delta = k * (result - expected);

    // round to 2 decimal places
    return Math.round(delta * 100) / 100;
};

export const getNewRating = (
    rating: number,
    opponentRating: number,
    result: 1 | 0 | 0.5,
    k: number,
): number => {
    return rating + getRatingDelta(rating, opponentRating, result, k);
};
