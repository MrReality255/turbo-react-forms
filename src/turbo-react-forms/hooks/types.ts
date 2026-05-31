import { TStateHandle } from '..';

export type TDataObjectMap = Record<string, TDataObjectValue>;
export type TDataObject = {
    data: TDataObjectMap;
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
    type: 'invalid';
};

export type TDataObjectValue =
    | string
    | TDataObject
    | TDataObjectList
    | TDataObjectInvalidValue;

export type TDataObjectWrapper = TDataObject & {};

export interface IDataObject {
    set: (key: string, value: TDataObjectValue) => void;
    get: (key: string) => TDataObjectValue;

    update: (
        key: string,
        fct: (prev: TDataObjectValue) => TDataObjectValue,
        incNr: boolean
    ) => void;

    getValue: (key: string) => string | null;
    getRawValue: (key: string) => string;
    setValue: (key: string, value: string, isValid: boolean) => void;

    listAdd: (key: string, initFct?: () => TDataObjectMap) => void;
    listGet: (key: string, idx: number) => IDataObject;
    listRemove: (key: string, idx?: number) => void;
    listItems: (key: string) => IDataObject[];
    objectGet: (key: string) => IDataObject;

    clone: () => TDataObject;
    getID: () => number;
    getRef: () => TDataObject;
}
