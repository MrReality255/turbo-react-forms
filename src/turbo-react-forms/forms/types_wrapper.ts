import {
    TFormConfig,
    TFormControlLib,
    TFormError,
    TFormSubformPropsType,
    TFormSubmitCtx,
    TFormSubmitFct,
    TFormTemplatePropsType,
} from '.';
import { TDataObjectMap, TDataObjectMetaMap, TKey } from '..';

export type TFormWrapperProps<
    P extends Record<string, unknown>,
    V extends Record<string, unknown>,
    F extends Record<string, unknown>,
    TT extends TFormTemplatePropsType,
    SFT extends TFormSubformPropsType,
    Ctx,
    SubmitType,
    RP extends object,
> = {
    config: TFormConfig<P, V, F, TT, SFT, Ctx, SubmitType, RP>;
    formCtx: Ctx;
    handle: number;
    initData: TDataObjectMap | null;
    initMetaData: TDataObjectMetaMap | null;
    lib: TFormControlLib<P, V, F, TT, SFT, RP>;
    section?: TKey;
    strictMode?: boolean;

    children?: React.ReactNode;

    onSubmit: TFormSubmitFct<Ctx, SubmitType> | undefined;
    onResolve: (ctx: TFormSubmitCtx<Ctx, SubmitType> | null) => void;
    onError?: (err: unknown) => TFormError;
};
