import { TFormControlBaseProps, TFormControlWrapperProps, TFormState } from '.';
import { TValidity } from '..';

export type TFormControlLib<
    P extends Record<string, unknown>,
    V extends Record<string, unknown>,
    F extends Record<string, unknown>,
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
        controlProps: TFormControlWrapperProps,
        hintTranslator: (hint: string | undefined) => string | undefined
    ) => React.ReactNode;
    onRenderMainWrapper: (
        content: React.ReactNode,
        props: F
    ) => React.ReactNode;
    onTranslateHint?: (hint: string) => string;
};

export type TFormControlDef<Props> = {
    onRender: (
        baseProps: TFormControlBaseProps,
        customProps: Props
    ) => React.ReactNode;
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
