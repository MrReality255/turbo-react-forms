import { IDataObject, TKey } from '..';

export type TFormSubmitFctCtx<Ctx> = {
    id: TKey | undefined;
    ctx: Ctx;
    rawData: IDataObject;
    customData: unknown;
};

export type TFormSubmitFctData<Ctx, SubmitType> = {
    id: TKey | undefined;
    submitData: SubmitType;
    rawData?: IDataObject;
    cancel?: boolean;
    close: boolean;
    ctxUpdateFct?: (prev: Ctx) => Ctx;
};

export type TFormSubmitCtx<Ctx, SubmitType> = {
    submitData: SubmitType;
    rawData: IDataObject;
    ctx: Ctx;
    id: TKey | undefined;
};

export type TFormSubmitFct<Ctx, SubmitType> = (
    submitCtx: TFormSubmitFctCtx<Ctx>
) => Promise<TFormSubmitFctData<Ctx, SubmitType>>;
