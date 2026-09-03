import {
    TFormControlList,
    TFormControlSpecificProps,
    TFormState,
    TFormSubformPropsType,
    TFormTemplatePropsType,
} from '.';
import { IDataObject, TDataObject, TDataObjectEvent } from '..';
import { TFormSubmitFct, TFormSubmitFctData } from './types_submit';

export type TFormCommandRec = { id: string; data?: unknown };
export type TFormCommand = string | TFormCommandRec;

export type TFormCommandCtx = {
    command: (cmd: TFormCommand) => void;
    submit: () => void;
    cancel: () => void;
    loading: <T>(loadFct: () => Promise<T>, onDone?: (src: T) => void) => void;
};

export type TFormConfig<
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
    form: F | ((state: TFormState<Ctx>, cmdCtx: TFormCommandCtx) => F);
    controls:
        | TFormControlList<P, V, TT, SFT, Ctx, RP>
        | ((state: TFormState<Ctx>, commandCtx: TFormCommandCtx) => TFormControlList<P, V, TT, SFT, Ctx, RP>);
    onRenderMainContainer?: (content: React.ReactNode, ctx: Ctx, state: TFormState<Ctx>) => React.ReactNode;
    onRenderMainWrapper?: (content: React.ReactNode, ctx: Ctx, state: TFormState<Ctx>) => React.ReactNode;
    onSubmit?: TFormSubmitFct<Ctx, SubmitType, FormEnv>;
    onTranslateHint?: (
        hint: string,
        id: string,
        props: TFormControlSpecificProps<P, V, TT, SFT, Ctx, RP> | null
    ) => string;
    onUpdate?: (
        command: TFormCommandRec | null,
        event: TDataObjectEvent | null,
        ctx: Ctx,
        data: TDataObject
    ) =>
        | TFormUpdateContext<Ctx, SubmitType, FormEnv>
        | undefined
        | Promise<TFormUpdateContext<Ctx, SubmitType, FormEnv> | undefined>;
};

export type TFormSettings = {
    strictMode?: boolean;
    allowSubmitInvalid?: boolean;
};

export type TFormUpdateContext<Ctx, SubmitType, FormEnv> = {
    ctx?: Ctx;
    modalResult?: TFormSubmitFctData<Ctx, SubmitType, FormEnv>;

    onUpdateData?: (prev: TDataObject, replacerFct: (fct: (x: IDataObject) => void) => TDataObject) => TDataObject;
    onUpdateEnv?: (prev: FormEnv) => FormEnv;
};
