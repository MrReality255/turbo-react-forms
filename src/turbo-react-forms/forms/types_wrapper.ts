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
    FormEnv,
> = {
    config: TFormConfig<P, V, F, TT, SFT, Ctx, SubmitType, RP, FormEnv>;
    formCtx: Ctx;
    handle: number | undefined;
    initData: TDataObjectMap | null;
    initMetaData: TDataObjectMetaMap | null;
    lib: TFormControlLib<P, V, F, TT, SFT, RP, FormEnv>;
    section?: TKey;
    allowSubmitInvalid?: boolean;
    strictMode?: boolean;

    children?: React.ReactNode;

    onSubmit: TFormSubmitFct<Ctx, SubmitType, FormEnv> | undefined;
    onResolve?: (ctx: TFormSubmitCtx<Ctx, SubmitType> | null) => void;
    onError?: (err: unknown) => TFormError;
};
