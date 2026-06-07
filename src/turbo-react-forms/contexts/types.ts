import { IDataObject, TRef, TStateHandle } from '..';

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

export type TFormContext<Ctx> = {
    ctx: Ctx;
    data: IDataObject;
    hideMethodRef: TRef<(origHide: () => void) => void>;

    close: () => void;
};

export type TFormControlContext = {
    id: string;
};
