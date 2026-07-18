import {
    TFormControlBaseProps,
    TFormControlWrapperProps,
    TFormState,
    TFormSubformPropsType,
    TFormTemplatePropsType,
    TFormTemplateStateProps,
} from '.';
import { IDataObject, TValidity } from '..';

export type TFormControlLib<
    P extends Record<string, unknown>,
    V extends Record<string, unknown>,
    F extends Record<string, unknown>,
    TT extends TFormTemplatePropsType,
    SFT extends TFormSubformPropsType,
> = {
    controls: {
        [K in keyof P]: TFormControlDef<P[K]>;
    };
    validators?: {
        [K in keyof V]: (value: string, props: P[keyof P] | null) => TValidity;
    };
    showMethod?: (contentProvider: (handle: number) => React.ReactNode) => void;
    hideMethod?: () => void;
    onRenderControl?: (
        content: React.ReactNode,
        visible: boolean,
        controlProps: TFormControlWrapperProps,
        hintTranslator: (hint: string | undefined) => string | undefined
    ) => React.ReactNode;
    onRenderMainWrapper: (content: React.ReactNode, props: F) => React.ReactNode;
    onRenderTemplate: (content: React.ReactNode, stateProps: TFormTemplateStateProps, props: TT) => React.ReactNode;
    onRenderTemplateRow: (
        content: React.ReactNode,
        idx: number,
        handle: number,
        stateProps: TFormTemplateStateProps,
        props: TT,
        isNew: boolean
    ) => React.ReactNode;
    onRenderTemplateRowControl: (
        content: React.ReactNode,
        rowIdx: number,
        stateProps: TFormTemplateStateProps,
        props: TT
    ) => React.ReactNode;
    onRenderSubform: (content: React.ReactNode, data: IDataObject, props: SFT) => React.ReactNode;
    onRenderSubformControl: (content: React.ReactNode, data: IDataObject, idx: number) => React.ReactNode;
    onTranslateHint?: (hint: string) => string;
};

export type TFormControlDef<Props> = {
    forcedDefaultValue?: string;
    renderHidden?: boolean;
    onRender: (baseProps: TFormControlBaseProps, customProps: Props) => React.ReactNode;
};

export type TFormStateLibCtx<
    P extends Record<string, unknown>,
    V extends Record<string, unknown>,
    F extends Record<string, unknown>,
    TT extends TFormTemplatePropsType,
    SFT extends TFormSubformPropsType,
    Ctx,
> = {
    state: TFormState<Ctx>;
    ctx: Ctx;
    lib: TFormControlLib<P, V, F, TT, SFT>;
};
