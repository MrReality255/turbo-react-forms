import { TFormState, TLayerProps, TStateHandle, TStateUpdateHandle } from '..';

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

export type TLayerContext = TLayerProps & {
    handle: number;
};

export type TFormContext<Ctx> = {
    stateHandle: TStateUpdateHandle<TFormState<Ctx>>;

    close: () => void;
};
