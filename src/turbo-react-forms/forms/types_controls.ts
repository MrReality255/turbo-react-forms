import { IDataObject, TDataObjectMap, TFormState, TKey, TValidity } from '..';

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
    SFT extends TFormSubformPropsType,
    Ctx,
> = {
    controls:
    | TFormControlList<P, V, TT, SFT, Ctx>
    | ((
        state: TFormState<Ctx>,
        rawData: IDataObject
    ) => TFormControlList<P, V, TT, SFT, Ctx>);
    onWrapControls?: (
        content: React.ReactNode,
        data: IDataObject
    ) => React.ReactNode;
    onWrapControl?: (
        content: React.ReactNode,
        data: IDataObject
    ) => React.ReactNode;
};

export type TFormTemplateStateProps = {
    disableAdd: boolean;
    disableDelete: boolean;
    count: number;

    triggerAdd: () => void;
    triggerDelete: (idx: number) => void
};

export type TFormTemplateProps<
    P extends Record<string, unknown>,
    V extends Record<string, unknown>,
    TT extends TFormTemplatePropsType,
    SFT extends TFormSubformPropsType,
    Ctx,
> = {
    controls:
    | TFormControlList<P, V, TT, SFT, Ctx>
    | ((
        state: TFormState<Ctx>,
        idx: number,
        handle: number
    ) => TFormControlList<P, V, TT, SFT, Ctx>);

    minCount?: number;
    maxCount?: number;
    onNewItem?: (idx: number, state: TFormState<Ctx>) => TDataObjectMap;
    onWrapRowControl?: (item: React.ReactNode, state: TFormState<Ctx>, idx: number) => React.ReactNode
    onWrapRow?: (item: React.ReactNode, props: TFormTemplateStateProps, state: TFormState<Ctx>, idx: number) => React.ReactNode
    onWrapTemplate?: (item: React.ReactNode, props: TFormTemplateStateProps, state: TFormState<Ctx>) => React.ReactNode
};

export type TFormControlTemplate<
    P extends Record<string, unknown>,
    V extends Record<string, unknown>,
    TT extends TFormTemplatePropsType,
    SFT extends TFormSubformPropsType,
    Ctx,
> = TFormControlCommonPropsDef & {
    class: 'template';
    template: TFormTemplateProps<P, V, TT, SFT, Ctx> & TT;
};

export type TFormControlSubform<
    P extends Record<string, unknown>,
    V extends Record<string, unknown>,
    TT extends TFormTemplatePropsType,
    SFT extends TFormSubformPropsType,
    Ctx,
> = TFormControlCommonPropsDef & {
    class: 'subform';
    useOwnDataObject?: boolean;
    subform: TFormSubformProps<P, V, TT, SFT, Ctx> & SFT;
};

export type TFormControlPlain<Ctx> = TFormControlRenderInfoProps & {
    class: 'plain';
    onRender: (ctx: Ctx) => React.ReactNode;
};

export type TFormControlAtomic<P, V, Type extends keyof P, Ctx> =
    | TFormControlTyped<P, V, Type, Ctx>
    | TFormControlDynamic<Ctx>
    | TFormControlCustom<V, Ctx>;

export type TFormControl<
    P extends Record<string, unknown>,
    V extends Record<string, unknown>,
    TT extends TFormTemplatePropsType,
    SFT extends TFormSubformPropsType,
    Type extends keyof P,
    Ctx,
> =
    | TFormControlAtomic<P, V, Type, Ctx>
    | TFormControlTemplate<P, V, TT, SFT, Ctx>
    | TFormControlSubform<P, V, TT, SFT, Ctx>
    | TFormControlPlain<Ctx>;

export type TFormControlList<
    P extends Record<string, unknown>,
    V extends Record<string, unknown>,
    TT extends TFormTemplatePropsType,
    SFT extends TFormSubformPropsType,
    Ctx,
> = (({
    [Type in keyof P]: TFormControl<P, V, TT, SFT, Type, Ctx>;
}[keyof P]) | null)[];

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
    TFormControlRenderInfoProps &
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
> =
    | P[keyof P]
    | TFormTemplateProps<P, V, TT, SFT, Ctx>
    | TFormSubformProps<P, V, TT, SFT, Ctx>;
