import { TDataObjectMap } from '../hooks';
import { TKey } from '../utils';

export type TFormMode = 'ready' | 'loading' | 'waiting';

export type TFormState<Ctx> = {
    ctx: Ctx;
    mode: TFormMode;
    handle: number;
};

export type TFormControlBaseProps = {
    id: string;
    value: string;
    disabled: boolean;
    onValueChange: (newValue: string) => void;
};

export type TFormControlDef<Props> = {
    onRender: (
        baseProps: TFormControlBaseProps,
        customProps: Props
    ) => React.ReactNode;
};

export type TFormControlLib<P extends Record<string, unknown>> = {
    controls: {
        [K in keyof P]: TFormControlDef<P[K]>;
    };
    showMethod?: (contentProvider: (handle: number) => React.ReactNode) => void;
};

export type TFormSubmitFct<Ctx, SubmitType> = (
    submitCtx: TFormSubmitFuncCtx<Ctx>
) => Promise<TFormSubmitCtx<Ctx, SubmitType>>;

export type TFormControlList<P extends Record<string, unknown>> = {
    [Type in keyof P]: {
        id: string;
        type: Type;
        prop: P[Type];
    };
}[keyof P][];

export type TFormConfig<P extends Record<string, unknown>, Ctx, SubmitType> = {
    controls:
        | TFormControlList<P>
        | ((state: TFormState<Ctx>) => TFormControlList<P>);
    onSubmit?: TFormSubmitFct<Ctx, SubmitType>;
};

export type TFormWrapperProps<Ctx> = {
    handle: number;
    formCtx: Ctx;

    children?: React.ReactNode;
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
