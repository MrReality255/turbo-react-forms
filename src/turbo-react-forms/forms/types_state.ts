import { IDataObject, TDataObject } from '../hooks';
import { THandleProvider, TKey } from '../utils';

export type TFormMode = 'ready' | 'loading' | 'waiting';

export type TFormError = {
    message: string;
    code?: number;
    data?: unknown;
};

export type TFormInternalState<Ctx> = {
    ctx: Ctx;
    mode: TFormMode;
    error: TFormError[] | TFormError | undefined;
    handle: number | undefined;
    section?: TKey;
    rawData: TDataObject;
    readOnly: boolean | ((state: TFormInternalState<Ctx>) => boolean);
    disabled: boolean | ((state: TFormInternalState<Ctx>) => boolean);
    inContainer: boolean;
    handleProvider: THandleProvider;
};

export type TFormState<Ctx> = TFormInternalState<Ctx> & {
    data: IDataObject;
};
