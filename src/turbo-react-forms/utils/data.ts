export const DataUtils = {
    using: function <T, R = T>(src: T, fct: (x: T) => R) {
        return fct(src);
    },
};
