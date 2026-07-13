import {
    DataUtils,
    IDataObject,
    TDataObject,
    TDataObjectEvent,
    TDataObjectList,
    TDataObjectMap,
    TDataObjectStateUpdateHandle,
    TDataObjectValue,
    TDataObjectMetaValue,
    THandleProvider,
    TValidity,
    TDataObjectMetaMap,
} from '..';

export const DataObjectUtils = {
    cloneDataObject,
    cloneDataObjectMap,
    create,
    replace,
    getList: function (get: () => TDataObjectValue): TDataObjectList | undefined {
        const value = get();
        if (value === undefined || typeof value === 'string' || value.type != 'list') {
            return undefined;
        }
        return value;
    },
    getRawValue: function (get: () => TDataObjectValue, objectAsJSON: boolean) {
        const v = get();
        if (typeof v === 'string') {
            return v;
        }
        if (v === undefined) {
            return '';
        }
        return v.type == 'invalid' ? v.value : objectAsJSON ? JSON.stringify(v) : '';
    },
    getString: function (get: () => TDataObjectValue) {
        return DataUtils.using(get(), (v) => (typeof v === 'string' ? v : null));
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
    newValue: function (value: string, isValid: TValidity): TDataObjectValue {
        return typeof isValid == 'boolean' && isValid
            ? value
            : {
                  type: 'invalid',
                  value: value,
                  hint: DataUtils.Validity.getHint(isValid),
              };
    },
    updateUniqueID,
    isValid,
    isValidValue,
};

function isValid(obj: TDataObjectMap): boolean {
    return Object.values(obj).every(isValidValue);
}

function isValidValue(value: TDataObjectValue): boolean {
    if (value === undefined || value === null) {
        return true;
    }
    if (typeof value === 'string') {
        return true;
    }
    switch (value.type) {
        case 'invalid':
            return false;
        case 'obj':
            return isValid(value.data);
        case 'list':
            return value.items.every((item) => isValid(item.data));
        default:
            return true;
    }
}

function cloneDataObject(src: TDataObject): TDataObject {
    return {
        id: src.id,
        type: 'obj',
        data: cloneDataObjectMap(src.data),
        metaInfo: cloneMetaData(src.metaInfo),
    };
}

function cloneDataObjectMap(src: TDataObjectMap): TDataObjectMap {
    return Object.fromEntries(Object.entries(src).map(([key, value]) => [key, cloneValue(value)]));
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
                hint: value.hint,
            };
    }
}

function updateUniqueID(value: TDataObject, handleProvider?: THandleProvider) {
    if (!handleProvider) {
        const p = DataUtils.newHandleProvider();
        updateUniqueID(value, p);
        return;
    }

    value.id = handleProvider();
    Object.values(value.data).forEach((item) => {
        if (typeof item === 'string' || item.type === 'invalid') {
            return;
        }

        switch (item.type) {
            case 'obj':
                updateUniqueID(item, handleProvider);
                return;
            case 'list':
                item.items.forEach((subitem) => {
                    updateUniqueID(subitem, handleProvider);
                });
        }
    });
}

function replace(target: IDataObject, newData: TDataObject): IDataObject {
    return create(
        {
            state: newData,
            updateState: target.getUpdateMethod(),
        },
        target.isStrictMode(),
        target.getHandleProvider()
    );
}

function create(os: TDataObjectStateUpdateHandle, strictMode: boolean, nextHandleProvider: () => number): IDataObject {
    return {
        isStrictMode: () => strictMode,
        getHandleProvider: () => nextHandleProvider,
        getUpdateMethod: () => os.updateState,

        get,
        set,
        update,

        getMetaBool,

        getHint: (key: string) => {
            const result = get(key);
            if (typeof result !== 'object' || result.type !== 'invalid') {
                return undefined;
            }
            return result.hint;
        },

        getValue: (key: string) => {
            return DataObjectUtils.getString(() => get(key));
        },

        getRawValue: (key: string, objectAsJSON?: boolean) => {
            return DataObjectUtils.getRawValue(() => get(key), objectAsJSON ?? false);
        },

        isValid: () => {
            return isValid(os.state.data);
        },

        isValueValid: (key: string) => {
            return DataUtils.using(get(key), (v) => typeof v !== 'object' || v.type !== 'invalid');
        },

        getValidity: (key: string) => {
            return DataUtils.using(get(key), (v) =>
                typeof v !== 'object' || v.type !== 'invalid' ? true : { valid: false, hint: v.hint }
            );
        },

        setValue: (key: string, value: string, isValid: TValidity) => {
            set(key, DataObjectUtils.newValue(value, isValid), {
                type: 'value',
                id: key,
                isValid: isValid,
                value: value,
                ownerID: os.state.id,
            });
        },

        objectGet: (key: string) => {
            return create(
                {
                    state: (os.state.data[key] ?? (strictMode ? undefined : { type: 'obj', data: {} })) as TDataObject,
                    updateState: function (fct: (prev: TDataObject) => TDataObject, eventInfo: TDataObjectEvent) {
                        update(
                            key,
                            (prev) => {
                                if (prev === undefined && !strictMode) {
                                    prev = {
                                        type: 'obj',
                                        data: {},
                                        id: nextHandleProvider(),
                                        metaInfo: {},
                                    };
                                }
                                return fct(prev as TDataObject);
                            },
                            eventInfo
                        );
                    },
                },
                strictMode,
                nextHandleProvider
            );
        },

        listAdd: function (key: string, initFct?: () => TDataObjectMap, metaData?: TDataObjectMetaMap) {
            const newValue = initFct?.() ?? {};
            update(
                key,
                (prev) => {
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
                                metaInfo: metaData ?? {},
                            },
                        ],
                    };
                },
                { type: 'list-add', id: key, ownerID: os.state.id }
            );
        },

        listItems: function (key: string) {
            const items = (get(key) as TDataObjectList)?.items ?? [];
            return items.map((item, itemIdx) => {
                return create(
                    {
                        state: item,
                        updateState: function (
                            itemUpdaterFct: (prev: TDataObject) => TDataObject,
                            eventInfo: TDataObjectEvent
                        ) {
                            update(
                                key,
                                (prevValue) => {
                                    const prevListObj = prevValue as TDataObjectList;
                                    return {
                                        type: 'list',
                                        items: prevListObj.items.map((prevListItem, prevItemIdx) =>
                                            prevItemIdx == itemIdx ? itemUpdaterFct(prevListItem) : prevListItem
                                        ),
                                    };
                                },
                                eventInfo
                            );
                        },
                    },
                    strictMode,
                    nextHandleProvider
                );
            });
        },

        listRemove: function (key: string, idx?: number) {
            update(
                key,
                (prev) => {
                    const list = prev as TDataObjectList;
                    idx = idx ?? list.items.length - 1;
                    return {
                        ...list,
                        items: list.items.filter((_, i) => i != idx),
                    };
                },
                { type: 'list-remove', id: key, idx, ownerID: os.state.id }
            );
        },

        listGet: function (key: string, idx: number) {
            const list = os.state.data[key] as TDataObjectList;
            return create(
                {
                    state: list.items[idx],
                    updateState: function (
                        ItemUpdaterFct: (prev: TDataObject) => TDataObject,
                        eventInfo: TDataObjectEvent
                    ) {
                        update(
                            key,
                            (prev) => {
                                const prevList = prev as TDataObjectList;
                                return {
                                    type: 'list',
                                    items: prevList.items.map((item, i) => {
                                        return i == idx ? ItemUpdaterFct(item) : item;
                                    }),
                                };
                            },
                            eventInfo
                        );
                    },
                },
                strictMode,
                nextHandleProvider
            );
        },

        clone: function () {
            return DataObjectUtils.cloneDataObject(os.state);
        },

        getRef: () => os.state,
        getID: () => os.state.id,
    };

    function getMetaBool(key: string): boolean {
        return (getMeta(key) as boolean | undefined) ?? false;
    }

    function getMeta(key: string): TDataObjectMetaValue | undefined {
        return os.state.metaInfo[key];
    }

    function get(key: string) {
        return os.state.data[key];
    }

    function set(key: string, value: TDataObjectValue, eventInfo: TDataObjectEvent) {
        os.updateState((prev) => {
            return {
                ...prev,
                data: {
                    ...prev.data,
                    [key]: value,
                },
            };
        }, eventInfo);
    }

    function update(key: string, fct: (prev: TDataObjectValue) => TDataObjectValue, eventInfo: TDataObjectEvent) {
        os.updateState((prev) => {
            return {
                ...prev,
                id: prev.id,
                data: {
                    ...prev.data,
                    [key]: fct(prev.data[key]),
                },
            };
        }, eventInfo);
    }
}

function cloneMetaData(data: TDataObjectMetaMap): TDataObjectMetaMap {
    return {
        ...data,
    };
}
