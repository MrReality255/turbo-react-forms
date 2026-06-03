import { TDataObjectList, TDataObjectMap, TDataObjectValue } from '../hooks';

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
        newValue: function (value: string, isValid: boolean): TDataObjectValue {
            return isValid ? value : { type: 'invalid', value };
        },
    },
    using: function <T, R = T>(src: T, fct: (x: T) => R) {
        return fct(src);
    },
};
