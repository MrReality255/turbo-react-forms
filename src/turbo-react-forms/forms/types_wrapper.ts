import {
    TFormConfig,
    TFormControlLib,
    TFormSubmitCtx,
    TFormSubmitFct,
    TFormTemplatePropsType,
} from '.';
import { TDataObjectMap, TKey } from '..';

export type TFormWrapperProps<
    P extends Record<string, unknown>,
    V extends Record<string, unknown>,
    F extends Record<string, unknown>,
    TT extends TFormTemplatePropsType,
    SFT extends TFormTemplatePropsType,
    Ctx,
    SubmitType,
> = {
    config: TFormConfig<P, V, F, TT, SFT, Ctx, SubmitType>;
    formCtx: Ctx;
    handle: number;
    initData: TDataObjectMap | null;
    lib: TFormControlLib<P, V, F, TT>;
    section?: TKey;
    strictMode?: boolean;

    children?: React.ReactNode;

    onSubmit: TFormSubmitFct<Ctx, SubmitType> | undefined;
    onResolve: (ctx: TFormSubmitCtx<Ctx, SubmitType> | null) => void;
};
