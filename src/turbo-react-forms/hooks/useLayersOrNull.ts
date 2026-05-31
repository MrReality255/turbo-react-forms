import { ctxLayer, ctxLayers } from '../contexts/LayersContext';
import { useContext, useMemo } from 'react';
import { TStateHandle } from '../utils';
import { TLayersState } from '../contexts/types';

export function useLayersOrNull() {
    const ctx = useContext(ctxLayers);
    const ch = useContext(ctxLayer);

    const mainLayerHandler = useMemo(() => {
        if (!ctx) {
            return null;
        }
        return newLayerHandler(ctx.main);
    }, [ctx?.main]);

    const localLayerHandler = useMemo(() => {
        if (!ctx) {
            return null;
        }
        return newLayerHandler(ctx.local);
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

function newLayerHandler(ctx: TStateHandle<TLayersState>) {
    return {
        showNotification: function (renderer: (nr: number) => React.ReactNode) {
            ctx.updateState((prev) => {
                const newHandle = prev.maxHandle;
                return {
                    ...prev,
                    maxHandle: newHandle + 2,
                    notifications: [
                        ...prev.notifications,
                        {
                            handle: newHandle,
                            renderFct: () => renderer(newHandle),
                        },
                    ],
                };
            });
        },

        hideNotification: function (nr?: number) {
            ctx.updateState((prev) => {
                const lastItem =
                    prev.notifications[prev.notifications.length - 1];
                const delHandle = nr ?? lastItem?.handle;

                if (delHandle === undefined) {
                    return prev;
                }
                return {
                    ...prev,
                    notifications: prev.notifications.filter(
                        (n) => n.handle != delHandle
                    ),
                };
            });
        },

        show: function (renderer: (nr: number) => React.ReactNode) {
            ctx.updateState((prev) => {
                const newHandle = prev.maxHandle;
                return {
                    ...prev,
                    maxHandle: newHandle + 2,
                    layers: [
                        ...prev.layers,
                        {
                            handle: newHandle,
                            renderFct: () => renderer(newHandle),
                        },
                    ],
                };
            });
        },
        hide: function (nr?: number) {
            ctx.updateState((prev) => {
                const lastItem = prev.layers[prev.layers.length - 1];
                const delHandle = nr ?? lastItem?.handle;

                if (delHandle === undefined) {
                    return prev;
                }
                return {
                    ...prev,
                    layers: prev.layers.filter((l) => l.handle != delHandle),
                };
            });
        },
    };
}
