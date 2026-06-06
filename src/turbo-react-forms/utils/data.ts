import { THandleProvider, TRef, TValidity } from '.';

export const DataUtils = {
    DataObject: {},
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
    newRef: function <T>(initValue: T): TRef<T> {
        return {
            current: initValue,
        };
    },
    using: function <T, R = T>(src: T, fct: (x: T) => R) {
        return fct(src);
    },
};

function isValid(v: TValidity): boolean {
    return typeof v === 'boolean' ? v : false;
}

function getHint(v: TValidity) {
    return typeof v === 'boolean' ? undefined : v.hint;
}
