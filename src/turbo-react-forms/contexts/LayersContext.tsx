import { createContext } from 'react';
import { TLayerContext, TLayersContext } from './types';

export const ctxLayers = createContext<TLayersContext | null>(null);
export const ctxLayer = createContext<TLayerContext | undefined>(undefined);
