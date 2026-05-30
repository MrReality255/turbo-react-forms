import { createContext } from 'react';
import { TStateHandle } from '../utils';
import { TLayerProps } from '../app';

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

export const ctxLayers = createContext<TLayersContext | null>(null);
export const ctxLayer = createContext<TLayerContext | undefined>(undefined);
