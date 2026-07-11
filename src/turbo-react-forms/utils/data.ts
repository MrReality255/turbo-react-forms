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
        while (provider() < maxID) { }
    },
    newRef: function <T>(initValue: T): TRef<T> {
        return {
            current: initValue,
        };
    },
    orNone,
    using,
};

function isValid(v: TValidity): boolean {
    return typeof v === 'boolean' ? v : false;
}

function getHint(v: TValidity) {
    return typeof v === 'boolean' ? undefined : v.hint;
}

function orNone<T, R>(src: T | undefined, converterFct: (src: T) => R) {
    return src !== undefined ? converterFct(src) : undefined;
}

function using<T, R = T>(src: T, fct: (x: T) => R) {
    return fct(src);
}
