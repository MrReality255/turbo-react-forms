import { IDataObject, TKey } from '..';

export type TFormSubmitFctCtx<Ctx> = {
    id: TKey | undefined;
    ctx: Ctx;
    rawData: IDataObject;
    customData: unknown;
};

export type TFormSubmitFctData<Ctx, SubmitType, FormEnv> = {
    id?: TKey | undefined;
    submitData: SubmitType;
    rawData?: IDataObject;
    cancel?: boolean;
    preventClose?: boolean;
    ctxUpdateFct?: (prev: Ctx) => Ctx;
    ctxUpdateEnv?: (prev: FormEnv) => FormEnv;
};

export type TFormSubmitCtx<Ctx, SubmitType> = {
    submitData: SubmitType;
    rawData: IDataObject;
    ctx: Ctx;
    id: TKey | undefined;
};

export type TFormSubmitFct<Ctx, SubmitType, FormEnv> = (
    submitCtx: TFormSubmitFctCtx<Ctx>
) => Promise<TFormSubmitFctData<Ctx, SubmitType, FormEnv>>;
