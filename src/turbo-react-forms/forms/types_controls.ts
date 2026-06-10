import { TDataObjectMap, TFormState, TKey, TValidity } from '..';

export type TFormControlTyped<
    P,
    V,
    Type extends keyof P,
    Ctx,
> = TFormControlCommonPropsDef &
    TFormControlAtomicProps<Ctx> & {
        class?: undefined;
        type: Type;
        prop: P[Type];
        validation?: keyof V;
    };

export type TFormControlDynamic<Ctx> = TFormControlCommonPropsDef &
    TFormControlAtomicProps<Ctx> & {
        class: 'dynamic';
        type: string;
        prop: Record<string, unknown>;
    };

export type TFormControlCustomProps<Ctx> = TFormControlBaseProps & {
    ctx: Ctx;
};

export type TFormControlCustom<V, Ctx> = TFormControlCommonPropsDef &
    TFormControlAtomicProps<Ctx> & {
        class: 'custom';
        validation?: keyof V;

        onRender: (props: TFormControlCustomProps<Ctx>) => React.ReactNode;
    };

export type TFormSubformProps<
    P extends Record<string, unknown>,
    V extends Record<string, unknown>,
    TT extends TFormTemplatePropsType,
    Ctx,
> = {
    controls:
        | TFormControlList<P, V, TT, Ctx>
        | ((state: TFormState<Ctx>) => TFormControlList<P, V, TT, Ctx>);
};

export type TFormTemplateStateProps = {
    disableAdd: boolean;
    disableDelete: boolean;

    triggerAdd: () => void;
};

export type TFormTemplateProps<
    P extends Record<string, unknown>,
    V extends Record<string, unknown>,
    TT extends TFormTemplatePropsType,
    Ctx,
> = {
    controls:
        | TFormControlList<P, V, TT, Ctx>
        | ((
              state: TFormState<Ctx>,
              idx: number,
              handle: number
          ) => TFormControlList<P, V, TT, Ctx>);

    minCount?: number;
    maxCount?: number;
    onNewItem?: (idx: number, state: TFormState<Ctx>) => TDataObjectMap;
    onWrapItems?: (
        item: React.ReactNode,
        props: TFormTemplateStateProps,
        state: TFormState<Ctx>
    ) => React.ReactNode;
    onWrapItem?: (item: React.ReactNode, idx: number) => React.ReactNode;
    onWrapItemControl?: (item: React.ReactNode, idx: number) => React.ReactNode;
};

export type TFormControlTemplate<
    P extends Record<string, unknown>,
    V extends Record<string, unknown>,
    TT extends TFormTemplatePropsType,
    Ctx,
> = TFormControlCommonPropsDef & {
    class: 'template';
    template: TFormTemplateProps<P, V, TT, Ctx>;
    props: TT;
};

export type TFormControlSubform<
    P extends Record<string, unknown>,
    V extends Record<string, unknown>,
    TT extends TFormTemplatePropsType,
    Ctx,
> = TFormControlCommonPropsDef & {
    class: 'subform';
    useOwnDataObject?: boolean;
    subform: TFormSubformProps<P, V, TT, Ctx>;
};

export type TFormControlPlain<Ctx> = TFormControlRenderInfoProps & {
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
    TT extends TFormTemplatePropsType,
    Type extends keyof P,
    Ctx,
> =
    | TFormControlString<P, V, Type, Ctx>
    | TFormControlTemplate<P, V, TT, Ctx>
    | TFormControlSubform<P, V, TT, Ctx>
    | TFormControlPlain<Ctx>;

export type TFormControlList<
    P extends Record<string, unknown>,
    V extends Record<string, unknown>,
    TT extends TFormTemplatePropsType,
    Ctx,
> = {
    [Type in keyof P]: TFormControl<P, V, TT, Type, Ctx>;
}[keyof P][];

export type TFormControlCommonProps = {
    id: string;

    disabled?: boolean;
    optional?: boolean;
    readOnly?: boolean;
};

export type TFormControlRenderInfoProps = {
    sectionID?: TKey;
    removed?: boolean;
    hidden?: boolean;
};

export type TFormControlAtomicProps<Ctx> = {
    defaultValue?: string;
    onGetDefaultValue?: (ctx: Ctx) => string;
    onWriteValue?: (newValue: string) => string;
    onReadValue?: (value: string) => string;
    onValidate?: (value: string, ctx: Ctx) => TValidity;
};

export type TFormControlCommonRenderInfoProps = TFormControlCommonProps &
    TFormControlRenderInfoProps;

export type TFormControlOuterProps = {
    label?: string | React.ReactNode;
    context?: TFormControlReactContext;
};

export type TFormControlReactContext = {
    top?: React.ReactNode;
    before?: React.ReactNode;
    after?: React.ReactNode;
    bottom?: React.ReactNode;
};

export type TFormControlCommonPropsDef = TFormControlCommonProps &
    TFormControlCommonRenderInfoProps &
    TFormControlOuterProps & {
        onWrap?: (content: React.ReactNode) => React.ReactNode;
    };

export type TFormControlBaseProps = TFormControlCommonProps & {
    value: string;
    valid: TValidity;
    onValueChange: (newValue: string) => void;
};

export type TFormTemplatePropsType = Record<string, unknown>;

export type TFormControlSpecificProps<
    P extends Record<string, unknown>,
    V extends Record<string, unknown>,
    TT extends TFormTemplatePropsType,
    Ctx,
> =
    | P[keyof P]
    | TFormTemplateProps<P, V, TT, Ctx>
    | TFormSubformProps<P, V, TT, Ctx>;
