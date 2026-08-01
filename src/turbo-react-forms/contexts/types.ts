import { IDataObject, TFormCommand, TFormSubmitFctData, TKey, TRef, TStateHandle } from '..';

export type TLayerRec = {
    handle: number;
    renderFct: () => React.ReactNode;
};

export type TLayersState = {
    maxHandle: number;
    layers: TLayerRec[];
    notifications: TLayerRec[];
};

export type TLayersContext = {
    main: TStateHandle<TLayersState>;
    local: TStateHandle<TLayersState>;
};

export type TLayerContext = {
    handle: number;
    hide: () => void;
};

export type TFormContext<Ctx, SubmitType, FormEnv = any> = {
    ctx: Ctx;
    data: IDataObject;
    hideMethodRef: TRef<(origHide: () => void) => void>;
    formEnv: FormEnv;
    setFormEnv: (updater: FormEnv | ((prev: FormEnv) => FormEnv)) => void;

    close: () => void;
    submit: (id?: TKey, customData?: unknown) => void;
    submitEx: (submitValue: TFormSubmitFctData<Ctx, SubmitType, FormEnv>) => void;
    triggerCommand: (command: TFormCommand | Promise<TFormCommand>) => void;
    triggerLoading: <T>(loaderFct: () => Promise<T>, onDone?: (src: T) => void) => void;
};

export type TFormControlContext = {
    id: string;
};
