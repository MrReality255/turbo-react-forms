export const MathUtils = {
  clamp: function (n: number, min: number, max: number) {
    return Math.min(Math.max(n, min), max);
  },
};
