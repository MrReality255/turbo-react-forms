import { TDataObjectMap } from '../hooks';
import { TKey } from '../utils';

export type TFormMode = 'ready' | 'loading' | 'waiting';

export type TFormState<Ctx> = {
    ctx: Ctx;
    mode: TFormMode;
    handle: number;
    section?: TKey;
    rawData: TDataObjectMap;
};

export type TFormControlDef<Props> = {
    onRender: (
        baseProps: TFormControlBaseProps,
        customProps: Props
    ) => React.ReactNode;
};

export type TFormControlLib<
    P extends Record<string, unknown>,
    V extends Record<string, unknown>,
    F extends Record<string, unknown>,
> = {
    controls: {
        [K in keyof P]: TFormControlDef<P[K]>;
    };
    validators?: {
        [K in keyof V]: (value: string) => boolean;
    };
    showMethod?: (contentProvider: (handle: number) => React.ReactNode) => void;
    hideMethod?: () => void;
    onRenderMainWrapper: (
        content: React.ReactNode,
        props: F
    ) => React.ReactNode;
};

export type TFormSubmitFct<Ctx, SubmitType> = (
    submitCtx: TFormSubmitFuncCtx<Ctx>
) => Promise<TFormSubmitCtx<Ctx, SubmitType>>;

export type TFormControlRenderProps = {
    sectionID?: TKey;
    removed?: boolean;
    hidden?: boolean;
};

export type TFormControlCommonProps = TFormControlRenderProps & {
    id: string;

    disabled?: boolean;
    optional?: boolean;
    readOnly?: boolean;

    onWrap?: (content: React.ReactNode) => React.ReactNode;
};

export type TFormControlBaseProps = TFormControlCommonProps & {
    value: string;
    onValueChange: (newValue: string) => void;
};

export type TFormControlCustomProps<Ctx> = {
    ctx: Ctx;
    disabled: boolean;
    value: string;

    onValueChange: (newValue: string) => void;
};

export type TFormControlAtomicProps<Ctx> = {
    defaultValue?: string;
    onGetDefaultValue?: (ctx: Ctx) => string;
    onWriteValue?: (newValue: string) => string;
    onReadValue?: (value: string) => string;
    onValidate?: (value: string, ctx: Ctx) => boolean;
};

export type TFormCustomControlProps<Ctx> = TFormControlBaseProps & {
    ctx: Ctx;
};

export type TFormControlTyped<
    P,
    V,
    Type extends keyof P,
    Ctx,
> = TFormControlCommonProps &
    TFormControlAtomicProps<Ctx> & {
        class?: undefined;
        type: Type;
        prop: P[Type];
        validation?: keyof V;
    };

export type TFormControlDynamic<Ctx> = TFormControlCommonProps &
    TFormControlAtomicProps<Ctx> & {
        class: 'dynamic';
        type: string;
        prop: Record<string, unknown>;
    };

export type TFormControlCustom<V, Ctx> = TFormControlCommonProps &
    TFormControlAtomicProps<Ctx> & {
        class: 'custom';
        validation?: keyof V;

        onRender: (props: TFormControlCustomProps<Ctx>) => React.ReactNode;
    };

export type TFormControlTemplate<
    P extends Record<string, unknown>,
    V extends Record<string, unknown>,
    Ctx,
> = TFormControlCommonProps & {
    class: 'template';
    template: TFormTemplateProps<P, V, Ctx>;
};

export type TFormControlSubform<
    P extends Record<string, unknown>,
    V extends Record<string, unknown>,
    Ctx,
> = TFormControlCommonProps & {
    class: 'subform';
    useOwnDataObject?: boolean;
    subform: TFormSubformProps<P, V, Ctx>;
};

export type TFormControlPlain<Ctx> = TFormControlRenderProps & {
    class: 'plain';
    onRender: (ctx: Ctx) => React.ReactNode;
};

export type TFormControlString<P, V, Type extends keyof P, Ctx> =
    | TFormControlTyped<P, V, Type, Ctx>
    | TFormControlDynamic<Ctx>
    | TFormControlCustom<V, Ctx>;

export type TFormControl<
    P extends Record<string, unknown>,
    V extends Record<string, unknown>,
    Type extends keyof P,
    Ctx,
> =
    | TFormControlString<P, V, Type, Ctx>
    | TFormControlTemplate<P, V, Ctx>
    | TFormControlSubform<P, V, Ctx>
    | TFormControlPlain<Ctx>;

export type TFormControlList<
    P extends Record<string, unknown>,
    V extends Record<string, unknown>,
    Ctx,
> = {
    [Type in keyof P]: TFormControl<P, V, Type, Ctx>;
}[keyof P][];

export type TFormSubformProps<
    P extends Record<string, unknown>,
    V extends Record<string, unknown>,
    Ctx,
> = {
    controls:
        | TFormControlList<P, V, Ctx>
        | ((state: TFormState<Ctx>) => TFormControlList<P, V, Ctx>);
};

export type TFormTemplateProps<
    P extends Record<string, unknown>,
    V extends Record<string, unknown>,
    Ctx,
> = {
    controls:
        | TFormControlList<P, V, Ctx>
        | ((
              state: TFormState<Ctx>,
              idx: number,
              handle: number
          ) => TFormControlList<P, V, Ctx>);

    minCount?: number;
    maxCount?: number;
};

export type TFormConfig<
    P extends Record<string, unknown>,
    V extends Record<string, unknown>,
    F extends Record<string, unknown>,
    Ctx,
    SubmitType,
> = {
    form: F;
    controls:
        | TFormControlList<P, V, Ctx>
        | ((state: TFormState<Ctx>) => TFormControlList<P, V, Ctx>);
    onSubmit?: TFormSubmitFct<Ctx, SubmitType>;
    onRenderMainWrapper?: (
        content: React.ReactNode,
        ctx: Ctx,
        state: TFormState<Ctx>
    ) => React.ReactNode;
};

export type TFormWrapperProps<
    P extends Record<string, unknown>,
    V extends Record<string, unknown>,
    F extends Record<string, unknown>,
    Ctx,
    SubmitType,
> = {
    config: TFormConfig<P, V, F, Ctx, SubmitType>;
    formCtx: Ctx;
    handle: number;
    initData: TDataObjectMap | null;
    lib: TFormControlLib<P, V, F>;
    section?: TKey;

    children?: React.ReactNode;

    onSubmit: TFormSubmitFct<Ctx, SubmitType> | undefined;
    onResolve: (ctx: TFormSubmitCtx<Ctx, SubmitType> | null) => void;
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

export type TFormStateLibCtx<
    P extends Record<string, unknown>,
    V extends Record<string, unknown>,
    F extends Record<string, unknown>,
    Ctx,
> = {
    state: TFormState<Ctx>;
    ctx: Ctx;
    lib: TFormControlLib<P, V, F>;
};

export type TFormStateHandleLibCtx<
    P extends Record<string, unknown>,
    V extends Record<string, unknown>,
    F extends Record<string, unknown>,
    Ctx,
> = TFormStateLibCtx<P, V, F, Ctx> & {
    updateState: (fct: (prev: TFormState<Ctx>) => TFormState<Ctx>) => void;
};
