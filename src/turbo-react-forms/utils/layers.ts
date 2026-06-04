import { TStateHandle } from '.';
import { TLayersState } from '../contexts/types';

export const LayerUtils = {
    newHandler,
};

function newHandler(ctx: TStateHandle<TLayersState>) {
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
