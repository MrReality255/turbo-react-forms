import { TStateHandle, TValidity } from '..';

export type TDataObjectMetaValue = boolean

export type TDataObjectMap = Record<string, TDataObjectValue>;
export type TDataObjectMetaMap = Record<string, TDataObjectMetaValue>;

export type TDataObject = {
    data: TDataObjectMap;
    metaInfo: TDataObjectMetaMap;
    type: 'obj';
    id: number;
};
export type TDataRootObject = TDataObject & { maxID: number };
export type TDataRoowObjectHandle = TStateHandle<TDataRootObject>;

export type TDataObjectList = {
    items: TDataObject[];
    type: 'list';
};
export type TDataObjectInvalidValue = {
    value: string;
    hint: string | undefined;
    type: 'invalid';
};

export type TDataObjectValue =
    | string
    | TDataObject
    | TDataObjectList
    | TDataObjectInvalidValue;

export type TDataObjectWrapper = TDataObject & {};

export interface IDataObject {
    set: (
        key: string,
        value: TDataObjectValue,
        eventInfo: TDataObjectEvent
    ) => void;
    get: (key: string) => TDataObjectValue;

    update: (
        key: string,
        fct: (prev: TDataObjectValue) => TDataObjectValue,
        eventInfo: TDataObjectEvent
    ) => void;

    getHint: (key: string) => string | undefined;
    getValue: (key: string) => string | null;
    getValidity: (key: string) => TValidity;
    getRawValue: (key: string, objectAsJson?: boolean) => string;
    isValueValid: (key: string) => boolean;
    isValid: () => boolean;
    setValue: (key: string, value: string, isValid: TValidity) => void;

    listAdd: (key: string, initFct?: () => TDataObjectMap, metaData?: TDataObjectMetaMap) => void;
    listGet: (key: string, idx: number) => IDataObject;
    listRemove: (key: string, idx?: number) => void;
    listItems: (key: string) => IDataObject[];
    objectGet: (key: string) => IDataObject;

    clone: () => TDataObject;
    getID: () => number;
    getRef: () => TDataObject;

    getMetaBool(key: string): boolean;
}

export interface ILayerManager {
    show: (ctrl: (handle: number) => React.ReactNode) => void;
    showNotification: (ctrl: (handle: number) => React.ReactNode) => void;

    hide: (handle?: number) => void;
    hideNotification: (handle?: number) => void;
}

export interface ILayers {
    main: ILayerManager;
    local: ILayerManager;

    hide: (handle?: number) => void;
    hideNotification: (handle?: number) => void;
}

export type TDataObjectNew = {
    strictMode?: boolean;
    initFct?: () => TDataObjectMap;
    initMeta?: () => TDataObjectMetaMap
};

export type TDataObjectStateUpdateHandle = {
    state: TDataObject;
    updateState: (
        fct: (prev: TDataObject) => TDataObject,
        eventInfo: TDataObjectEvent
    ) => void;
};

export type TDataObjectEvent =
    | TDataObjectValueEvent
    | TDataObjectEventListAddEvent
    | TDataObjectEventListRemoveEvent;

export type TDataObjectValueEvent = {
    type: 'value';
    id: string;
    value: string;
    isValid: TValidity | null;
    ownerID: number;
};

export type TDataObjectEventListAddEvent = {
    type: 'list-add';
    id: string;
    ownerID: number;
};

export type TDataObjectEventListRemoveEvent = {
    type: 'list-remove';
    id: string;
    ownerID: number;
    idx: number | undefined;
};
