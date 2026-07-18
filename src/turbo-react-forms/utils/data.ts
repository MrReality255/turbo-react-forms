import { THandleProvider, TRef, TValidity } from '.';

export const DataUtils = {
    Validity: {
        isValid,
        getHint,
    },
    newHandleProvider: function () {
        const handleRef = {
            current: 1,
        };
        return function () {
            return handleRef.current++;
        };
    },
    shiftHandleProvider: function (provider: THandleProvider, maxID: number) {
        while (provider() < maxID) {}
    },
    newRef: function <T>(initValue: T): TRef<T> {
        return {
            current: initValue,
        };
    },
    distinct<T>(options: T[]): T[] {
        return options.filter((v, idx, arr) => arr.indexOf(v) === idx);
    },
    orNone<T, R = T>(x: T | undefined, fct: (x: T) => R, defaultValue?: R): R | undefined {
        return x !== undefined ? fct(x) : defaultValue;
    },
    using,
};

function isValid(v: TValidity): boolean {
    return typeof v === 'boolean' ? v : false;
}

function getHint(v: TValidity) {
    return typeof v === 'boolean' ? undefined : v.hint;
}

function using<T, R = T>(src: T, fct: (x: T) => R) {
    return fct(src);
}
