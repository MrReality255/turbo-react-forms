import { useState } from 'react';
import { ctxLayers, TLayerRec } from '../contexts/AppLayers';
import { TLayerContainerProps } from './types';

export function TLayerContainer(p: TLayerContainerProps) {
  const [layers, setLayers] = useState<TLayerRec[]>([]);
  const mainWrapper =
    p.mainWrapper ??
    ((content) => (
      <div style={{ position: 'relative', width: '100%', height: '100%', margin: 0, padding: 0 }}>{content}</div>
    ));
  const contentWrapper = p.contentWrapper ?? ((c) => <div style={{ zIndex: 0 }}>{c}</div>);
  const layerWrapper =
    p.layerWrapper ??
    ((key, zIdx) => (c) => (
      <div style={{ zIndex: zIdx, position: 'absolute', left: '0', top: '0', width: '100%', height: '100%' }} key={key}>
        {c}
      </div>
    ));
  return mainWrapper(
    <ctxLayers.Provider value={{ layers, updateLayers: setLayers }}>
      {contentWrapper(p.children)}
      {layers.map((layer, idx) => {
        const layerFct = layerWrapper(layer.handle, idx + 1);
        return layerFct(layer.renderFct());
      })}
    </ctxLayers.Provider>,
  );
}
