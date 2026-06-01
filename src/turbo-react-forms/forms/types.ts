export type TFormMode = 'ready' | 'loading' | 'waiting';

export type TFormState = {
    ctx: unknown | null;
    mode: TFormMode;
};

export type TFormContext = TFormState & {
    submit: () => void;
    close: () => void;
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
};

export type TFormControlList<P extends Record<string, unknown>> = {
    [Type in keyof P]: {
        id: string;
        type: Type;
        prop: P[Type];
    };
}[keyof P][];
