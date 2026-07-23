import { IDataObject, TDataObjectMap, TFormState, TKey, TValidity } from '..';

export type TFormControlTyped<P, V, Type extends keyof P, Ctx, RP extends object> = TFormControlCommonPropsDef<RP> &
    TFormControlAtomicProps<Ctx> & {
        class?: undefined;
        type: Type;
        prop: P[Type];
        validation?: keyof V;
    };

export type TFormControlDynamic<Ctx, RP extends object> = TFormControlCommonPropsDef<RP> &
    TFormControlAtomicProps<Ctx> & {
        class: 'dynamic';
        type: string;
        prop: Record<string, unknown>;
    };

export type TFormControlCustomProps<Ctx> = TFormControlBaseProps & {
    ctx: Ctx;
};

export type TFormControlCustom<V, Ctx, RP extends object> = TFormControlCommonPropsDef<RP> &
    TFormControlAtomicProps<Ctx> & {
        class: 'custom';
        validation?: keyof V;

        onRender: (props: TFormControlCustomProps<Ctx>) => React.ReactNode;
    };

export type TFormSubformProps<
    P extends Record<string, unknown>,
    V extends Record<string, unknown>,
    TT extends TFormTemplatePropsType,
    SFT extends TFormSubformPropsType,
    Ctx,
    RP extends object,
> = {
    controls:
        | TFormControlList<P, V, TT, SFT, Ctx, RP>
        | ((state: TFormState<Ctx>, rawData: IDataObject) => TFormControlList<P, V, TT, SFT, Ctx, RP>);
    onWrapControls?: (content: React.ReactNode, data: IDataObject) => React.ReactNode;
    onWrapControl?: (content: React.ReactNode, data: IDataObject) => React.ReactNode;
};

export type TFormTemplateStateProps = {
    disableAdd: boolean;
    disableDelete: boolean;
    count: number;

    triggerAdd: () => void;
    triggerDelete: (idx: number) => void;
};

export type TFormTemplateProps<
    P extends Record<string, unknown>,
    V extends Record<string, unknown>,
    TT extends TFormTemplatePropsType,
    SFT extends TFormSubformPropsType,
    Ctx,
    RP extends object,
> = {
    controls:
        | TFormControlList<P, V, TT, SFT, Ctx, RP>
        | ((state: TFormState<Ctx>, idx: number, handle: number) => TFormControlList<P, V, TT, SFT, Ctx, RP>);

    minCount?: number;
    maxCount?: number;
    onNewItem?: (idx: number, state: TFormState<Ctx>) => TDataObjectMap;
    onWrapRowControl?: (item: React.ReactNode, state: TFormState<Ctx>, idx: number) => React.ReactNode;
    onWrapRow?: (
        item: React.ReactNode,
        props: TFormTemplateStateProps,
        state: TFormState<Ctx>,
        idx: number
    ) => React.ReactNode;
    onWrapTemplate?: (item: React.ReactNode, props: TFormTemplateStateProps, state: TFormState<Ctx>) => React.ReactNode;
};

export type TFormControlTemplate<
    P extends Record<string, unknown>,
    V extends Record<string, unknown>,
    TT extends TFormTemplatePropsType,
    SFT extends TFormSubformPropsType,
    Ctx,
    RP extends object,
> = TFormControlCommonPropsDef<RP> & {
    class: 'template';
    template: TFormTemplateProps<P, V, TT, SFT, Ctx, RP> & TT;
};

export type TFormControlSubform<
    P extends Record<string, unknown>,
    V extends Record<string, unknown>,
    TT extends TFormTemplatePropsType,
    SFT extends TFormSubformPropsType,
    Ctx,
    RP extends object,
> = TFormControlCommonPropsDef<RP> & {
    class: 'subform';
    useOwnDataObject?: boolean;
    subform: TFormSubformProps<P, V, TT, SFT, Ctx, RP> & SFT;
};

export type TFormControlPlain<Ctx, RP extends object> = TFormControlRenderInfoProps<RP> & {
    class: 'plain';
    onRender: (ctx: Ctx) => React.ReactNode;
};

export type TFormControlAtomic<P, V, Type extends keyof P, Ctx, RP extends object> =
    | TFormControlTyped<P, V, Type, Ctx, RP>
    | TFormControlDynamic<Ctx, RP>
    | TFormControlCustom<V, Ctx, RP>;

export type TFormControl<
    P extends Record<string, unknown>,
    V extends Record<string, unknown>,
    TT extends TFormTemplatePropsType,
    SFT extends TFormSubformPropsType,
    Type extends keyof P,
    Ctx,
    RP extends object,
> =
    | TFormControlAtomic<P, V, Type, Ctx, RP>
    | TFormControlTemplate<P, V, TT, SFT, Ctx, RP>
    | TFormControlSubform<P, V, TT, SFT, Ctx, RP>
    | TFormControlPlain<Ctx, RP>;

export type TFormControlList<
    P extends Record<string, unknown>,
    V extends Record<string, unknown>,
    TT extends TFormTemplatePropsType,
    SFT extends TFormSubformPropsType,
    Ctx,
    RP extends object,
> = (
    | {
          [Type in keyof P]: TFormControl<P, V, TT, SFT, Type, Ctx, RP>;
      }[keyof P]
    | null
)[];

export type TFormControlInheritedStateProps = {
    disabled: boolean;
    hidden: boolean;
    readOnly: boolean;
    removed: boolean;
};

export type TFormControlCommonProps = {
    id: string;

    disabled?: boolean;
    optional?: boolean;
    readOnly?: boolean;
};

export type TFormControlRenderInfoProps<RP extends object> = {
    sectionID?: TKey;
    removed?: boolean;
    hidden?: boolean;
    renderProps?: RP;
};

export type TFormControlAtomicProps<Ctx> = {
    defaultValue?: string;
    onGetDefaultValue?: (ctx: Ctx) => string;
    onWriteValue?: (newValue: string) => string;
    onReadValue?: (value: string) => string;
    onValidate?: (value: string, ctx: Ctx) => TValidity;
};

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

export type TFormControlCommonPropsDef<RP extends object> = TFormControlCommonProps &
    TFormControlRenderInfoProps<RP> &
    TFormControlOuterProps & {
        onWrap?: (content: React.ReactNode) => React.ReactNode;
    };

export type TFormControlBaseProps = TFormControlCommonProps & {
    value: string;
    valid: TValidity;
    onValueChange: (newValue: string) => void;
};

export type TFormTemplatePropsType = Record<string, unknown>;
export type TFormSubformPropsType = Record<string, unknown>; // Record<string, unknown>;

export type TFormControlSpecificProps<
    P extends Record<string, unknown>,
    V extends Record<string, unknown>,
    TT extends TFormTemplatePropsType,
    SFT extends TFormSubformPropsType,
    Ctx,
    RP extends object,
> = P[keyof P] | TFormTemplateProps<P, V, TT, SFT, Ctx, RP> | TFormSubformProps<P, V, TT, SFT, Ctx, RP>;
