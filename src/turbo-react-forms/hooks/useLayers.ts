import { ctxLayers } from '../contexts/AppLayers';
import { useContext } from 'react';

export function useLayers() {
  const ctx = useContext(ctxLayers);
  if (!ctx) {
    throw 'missing context ctxLayers';
  }
  return {
    show: function (renderFct: (nr: number) => React.ReactNode) {
      let nr = -1;

      ctx.updateLayers((prev) => {
        nr = prev.reduce((a, b) => Math.max(a, b.handle), 0) + 1;
        return [...prev, { handle: nr, renderFct: () => renderFct(nr) }];
      });
      return nr;
    },
    hide: function (nr?: number) {
      ctx.updateLayers((oldLayers) => {
        nr = nr ?? oldLayers[oldLayers.length - 1].handle;
        return oldLayers.filter((layer) => layer.handle != nr);
      });
    },
  };
}
