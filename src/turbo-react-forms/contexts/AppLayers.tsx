import { createContext } from 'react';
import { TStateHandle } from '../utils';

export type TLayerRec = {
    handle: number;
    renderFct: () => React.ReactNode;
};

export type TLayerState = {
    maxHandle: number;
    layers: TLayerRec[];
    notifications: TLayerRec[];
};

export type TLayerContext = {
    main: TStateHandle<TLayerState>;
    local: TStateHandle<TLayerState>;
};

export const ctxLayers = createContext<TLayerContext | null>(null);
