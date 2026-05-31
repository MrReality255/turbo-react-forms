export type TDataObjectMap = Record<string, TDataObjectValue>;
export type TDataObject = {
    data: TDataObjectMap;
    type: 'obj';
};
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
        fct: (prev: TDataObjectValue) => TDataObjectValue
    ) => void;

    getValue: (key: string) => string | null;
    getRawValue: (key: string) => string;
    setValue: (key: string, value: string, isValid: boolean) => void;

    listAdd: (key: string, initFct?: () => TDataObjectMap) => void;
    listGet: (key: string, idx: number) => IDataObject;
    listRemove: (key: string, idx?: number) => void;
    objectGet: (key: string) => IDataObject;

    clone: () => TDataObject;
    getRef: () => TDataObject;
}
