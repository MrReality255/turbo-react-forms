import { useMemo, useState } from 'react';
import {
    IDataObject,
    TDataObject,
    TDataObjectList,
    TDataObjectMap,
    TDataObjectValue,
} from './types';
import { DataUtils, TStateHandle } from '../utils';

export function useNewDataObject(initFct?: () => TDataObjectMap) {
    const initData = useMemo(() => {
        return initFct?.() ?? {};
    }, []);
    const [obj, updateObj] = useState<TDataObject>({
        type: 'obj',
        data: initData,
    });
    const objHandle = useMemo(() => {
        return {
            setState: updateObj,
            state: obj,
            updateState: updateObj,
        };
    }, [obj]);
    return useMemo(() => {
        return createNewDataObject(objHandle);
    }, [objHandle]);
}

function createNewDataObject(os: TStateHandle<TDataObject>): IDataObject {
    return {
        get,
        set,
        update,

        getValue: (key: string) => {
            return DataUtils.using(get(key), (v) =>
                typeof v === 'string' ? v : null
            );
        },

        getRawValue: (key: string) => {
            const v = get(key);
            if (typeof v === 'string') {
                return v;
            }
            return v.type == 'invalid' ? v.value : JSON.stringify(v);
        },

        setValue: (key: string, value: string, isValid: boolean) => {
            set(key, isValid ? value : { type: 'invalid', value });
        },

        objectGet: (key: string) => {
            return createNewDataObject({
                state: os.state.data[key] as TDataObject,
                setState: function (newVal: TDataObject) {
                    set(key, newVal);
                },
                updateState: function (
                    fct: (prev: TDataObject) => TDataObject
                ) {
                    update(key, (prev) => fct(prev as TDataObject));
                },
            });
        },

        listAdd: function (key: string, initFct?: () => TDataObjectMap) {
            const newValue = initFct?.() ?? {};
            update(key, (prev) => {
                const list = prev as TDataObjectList;
                return {
                    ...list,
                    type: 'list',
                    items: [
                        ...list.items,
                        {
                            type: 'obj',
                            data: newValue,
                        },
                    ],
                };
            });
        },

        listRemove: function (key: string, idx?: number) {
            update(key, (prev) => {
                const list = prev as TDataObjectList;
                idx = idx ?? list.items.length - 1;
                return {
                    ...list,
                    items: list.items.filter((_, i) => i != idx),
                };
            });
        },

        listGet: function (key: string, idx: number) {
            const list = os.state.data[key] as TDataObjectList;
            return createNewDataObject({
                state: list.items[idx],
                setState: function (newVal: TDataObject) {
                    update(key, (prev) => {
                        const prevList = prev as TDataObjectList;
                        return {
                            type: 'list',
                            items: prevList.items.map((item, i) => {
                                return i == idx ? newVal : item;
                            }),
                        };
                    });
                },
                updateState: function (
                    fct: (prev: TDataObject) => TDataObject
                ) {
                    update(key, (prev) => {
                        const prevList = prev as TDataObjectList;
                        return {
                            type: 'list',
                            items: prevList.items.map((item, i) => {
                                return i == idx ? fct(item) : item;
                            }),
                        };
                    });
                },
            });
        },

        clone: function () {
            return cloneDataObject(os.state);
        },

        getRef: () => os.state,
    };

    function get(key: string) {
        return os.state.data[key];
    }

    function set(key: string, value: TDataObjectValue) {
        os.updateState((prev) => {
            return {
                ...prev,
                data: {
                    ...prev.data,
                    [key]: value,
                },
            };
        });
    }

    function update(
        key: string,
        fct: (prev: TDataObjectValue) => TDataObjectValue
    ) {
        os.updateState((prev) => {
            return {
                ...prev,
                data: {
                    ...prev.data,
                    [key]: fct(prev.data[key]),
                },
            };
        });
    }
}

function cloneDataObject(src: TDataObject): TDataObject {
    return {
        type: 'obj',
        data: Object.fromEntries(
            Object.entries(src.data).map(([key, value]) => [
                key,
                cloneValue(value),
            ])
        ),
    };
}

function cloneValue(value: TDataObjectValue): TDataObjectValue {
    if (typeof value == 'string') {
        return String(value);
    }

    switch (value.type) {
        case 'obj':
            return cloneDataObject(value);
        case 'list':
            return {
                type: 'list',
                items: value.items.map((v) => cloneDataObject(v)),
            };
        case 'invalid':
            return {
                type: 'invalid',
                value: value.value,
            };
    }
}
