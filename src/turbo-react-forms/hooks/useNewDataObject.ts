import { useMemo, useState } from 'react';
import {
    IDataObject,
    TDataObject,
    TDataObjectList,
    TDataObjectMap,
    TDataObjectValue,
    TDataRootObject,
} from './types';
import { DataUtils, TStateUpdateHandle } from '../utils';

export function useNewDataObject(
    initFct?: () => TDataObjectMap,
    strictMode?: boolean
) {
    const initData = useMemo(() => {
        return initFct?.() ?? {};
    }, []);
    const [obj, updateObj] = useState<TDataRootObject>({
        type: 'obj',
        data: initData,
        id: 1,
        maxID: 2,
    });

    const objHandle = useMemo(() => {
        return {
            state: obj,
            updateState: updateRootObj,
        };
    }, [obj]);
    return useMemo(() => {
        return createNewDataObject(
            objHandle,
            strictMode ?? false,
            () => objHandle.state.maxID
        );
    }, [objHandle]);

    function updateRootObj(fct: (prev: TDataObject) => TDataObject) {
        updateObj((prev) => {
            return {
                ...fct(prev),
                maxID: prev.maxID + 1,
            };
        });
    }
}

function createNewDataObject(
    os: TStateUpdateHandle<TDataObject>,
    strictMode: boolean,
    nextHandleProvider: () => number
): IDataObject {
    return {
        get,
        set,
        update,

        getValue: (key: string) => {
            return DataUtils.DataObject.getString(() => get(key));
        },

        getRawValue: (key: string, objectAsJSON?: boolean) => {
            return DataUtils.DataObject.getRawValue(
                () => get(key),
                objectAsJSON ?? false
            );
        },

        setValue: (key: string, value: string, isValid: boolean) => {
            set(key, DataUtils.DataObject.newValue(value, isValid));
        },

        objectGet: (key: string) => {
            return createNewDataObject(
                {
                    state: (os.state.data[key] ??
                        (strictMode
                            ? undefined
                            : { type: 'obj', data: {} })) as TDataObject,
                    updateState: function (
                        fct: (prev: TDataObject) => TDataObject
                    ) {
                        update(key, (prev) => {
                            if (prev === undefined && !strictMode) {
                                prev = {
                                    type: 'obj',
                                    data: {},
                                    id: nextHandleProvider(),
                                };
                            }
                            return fct(prev as TDataObject);
                        });
                    },
                },
                strictMode,
                nextHandleProvider
            );
        },

        listAdd: function (key: string, initFct?: () => TDataObjectMap) {
            const newValue = initFct?.() ?? {};
            update(key, (prev) => {
                const list = prev as TDataObjectList;
                return {
                    ...list,
                    type: 'list',
                    items: [
                        ...(list?.items ?? []),
                        {
                            id: nextHandleProvider(),
                            type: 'obj',
                            data: newValue,
                        },
                    ],
                };
            });
        },

        listItems: function (key: string) {
            const items = (get(key) as TDataObjectList)?.items ?? [];
            return items.map((item, itemIdx) => {
                return createNewDataObject(
                    {
                        state: item,
                        updateState: function (
                            itemUpdaterFct: (prev: TDataObject) => TDataObject
                        ) {
                            update(key, (prevValue) => {
                                const prevListObj =
                                    prevValue as TDataObjectList;
                                return {
                                    type: 'list',
                                    items: prevListObj.items.map(
                                        (prevListItem, prevItemIdx) =>
                                            prevItemIdx == itemIdx
                                                ? itemUpdaterFct(prevListItem)
                                                : prevListItem
                                    ),
                                };
                            });
                        },
                    },
                    strictMode,
                    nextHandleProvider
                );
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
            return createNewDataObject(
                {
                    state: list.items[idx],
                    updateState: function (
                        ItemUpdaterFct: (prev: TDataObject) => TDataObject
                    ) {
                        update(key, (prev) => {
                            const prevList = prev as TDataObjectList;
                            return {
                                type: 'list',
                                items: prevList.items.map((item, i) => {
                                    return i == idx
                                        ? ItemUpdaterFct(item)
                                        : item;
                                }),
                            };
                        });
                    },
                },
                strictMode,
                nextHandleProvider
            );
        },

        clone: function () {
            return cloneDataObject(os.state);
        },

        getRef: () => os.state,
        getID: () => os.state.id,
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
                id: prev.id,
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
        id: src.id,
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
