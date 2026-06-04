import { ctxLayer, ctxLayers } from '../contexts/LayersContext';
import { useContext, useMemo } from 'react';
import { LayerUtils } from '../utils';
import { ILayers } from '.';

export function useLayersOrNull(): ILayers | null {
    const ctx = useContext(ctxLayers);
    const ch = useContext(ctxLayer);

    const mainLayerHandler = useMemo(() => {
        if (!ctx) {
            return null;
        }
        return LayerUtils.newHandler(ctx.main);
    }, [ctx?.main]);

    const localLayerHandler = useMemo(() => {
        if (!ctx) {
            return null;
        }
        return LayerUtils.newHandler(ctx.local);
    }, [ctx?.local]);

    if (!mainLayerHandler || !localLayerHandler) {
        return null;
    }

    return {
        main: mainLayerHandler,
        local: localLayerHandler,
        hide: (handle?: number) => {
            handle = handle ?? ch?.handle;
            if (handle === undefined) {
                console.warn('handle must be explicitly provided');
                return;
            }
            if (handle & 1) {
                localLayerHandler.hide(handle);
            } else {
                mainLayerHandler.hide(handle);
            }
        },
        hideNotification: (handle?: number) => {
            handle = handle ?? ch?.handle;
            if (handle === undefined) {
                console.warn('handle must be explicitly provided');
                return;
            }
            if (handle & 1) {
                localLayerHandler.hideNotification(handle);
            } else {
                mainLayerHandler.hideNotification(handle);
            }
        },
    };
}
