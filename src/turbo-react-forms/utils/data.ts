import { TRef, TValidity } from '.';
import { TDataObjectList, TDataObjectValue } from '../hooks';

export const DataUtils = {
    DataObject: {
        getRawValue: function (
            get: () => TDataObjectValue,
            objectAsJSON: boolean
        ) {
            const v = get();
            if (typeof v === 'string') {
                return v;
            }
            if (v === undefined) {
                return '';
            }
            return v.type == 'invalid'
                ? v.value
                : objectAsJSON
                  ? JSON.stringify(v)
                  : '';
        },
        getString: function (get: () => TDataObjectValue) {
            return DataUtils.using(get(), (v) =>
                typeof v === 'string' ? v : null
            );
        },
        getList: function (
            get: () => TDataObjectValue
        ): TDataObjectList | undefined {
            const value = get();
            if (
                value === undefined ||
                typeof value === 'string' ||
                value.type != 'list'
            ) {
                return undefined;
            }
            return value;
        },
        getValidity: function (get: () => TDataObjectValue): TValidity {
            const v = get();
            if (typeof v !== 'object' || v.type !== 'invalid') {
                return true;
            }
            return {
                valid: false,
                hint: v.hint,
            };
        },
        newValue: function (
            value: string,
            isValid: TValidity
        ): TDataObjectValue {
            return typeof isValid == 'boolean'
                ? value
                : {
                      type: 'invalid',
                      value: value,
                      hint: getHint(isValid),
                  };
        },
    },
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
