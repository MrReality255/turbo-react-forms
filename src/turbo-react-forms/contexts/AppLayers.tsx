import { createContext } from 'react';

export type TLayerRec = {
  handle: number;
  renderFct: () => React.ReactNode;
};

export type TLayerRecs = {
  layers: TLayerRec[];
  updateLayers: (updater: (old: TLayerRec[]) => TLayerRec[]) => void;
};

export const ctxLayers = createContext<TLayerRecs | null>(null);
