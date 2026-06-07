import { TFormControlList, TFormModalResult, TFormState } from '.';
import { TDataObject, TDataObjectEvent, TDataObjectMap, TKey } from '..';

export type TFormConfig<
    P extends Record<string, unknown>,
    V extends Record<string, unknown>,
    F extends Record<string, unknown>,
    Ctx,
    SubmitType,
> = {
    form: F | ((state: TFormState<Ctx>) => F);
    controls:
        | TFormControlList<P, V, Ctx>
        | ((state: TFormState<Ctx>) => TFormControlList<P, V, Ctx>);
    onRenderMainWrapper?: (
        content: React.ReactNode,
        ctx: Ctx,
        state: TFormState<Ctx>
    ) => React.ReactNode;
    onSubmit?: TFormSubmitFct<Ctx, SubmitType>;
    onUpdate?: (
        command: string | null,
        event: TDataObjectEvent,
        ctx: Ctx,
        data: TDataObject
    ) =>
        | TFormUpdateContext<Ctx, SubmitType>
        | undefined
        | Promise<TFormUpdateContext<Ctx, SubmitType> | undefined>;
};

export type TFormSubmitFuncCtx<Ctx> = {
    id: TKey;
    ctx: Ctx;
    rawData: TDataObjectMap;
    validData: TDataObjectMap;
};

export type TFormSubmitCtx<Ctx, SubmitType> = TFormSubmitFuncCtx<Ctx> & {
    submitData: SubmitType;
};

export type TFormSubmitFct<Ctx, SubmitType> = (
    submitCtx: TFormSubmitFuncCtx<Ctx>
) => Promise<TFormSubmitCtx<Ctx, SubmitType>>;

export type TFormUpdateContext<Ctx, SubmitType> = {
    ctx?: Ctx;
    modalResult?: {
        result: TFormModalResult;
        data: SubmitType;
    };

    onUpdateData?: (prev: TDataObject) => TDataObject;
};
