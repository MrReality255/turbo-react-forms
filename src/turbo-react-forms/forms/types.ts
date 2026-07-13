import { IDataObject, TDataObject } from '../hooks';
import { THandleProvider, TKey } from '../utils';

export type TFormMode = 'ready' | 'loading' | 'waiting';
export type TFormModalResult = 'submit' | 'cancel';
export type TFormError = {
    message: string;
    code?: number;
    data?: unknown;
};

export type TFormInternalState<Ctx> = {
    ctx: Ctx;
    mode: TFormMode;
    error: TFormError[] | TFormError | undefined;
    handle: number;
    section?: TKey;
    rawData: TDataObject;
    handleProvider: THandleProvider;
};

export type TFormState<Ctx> = TFormInternalState<Ctx> & {
    data: IDataObject;
};

// LIB

// SUBMIT

// LIB

// CONFIG
// WRAPPER
