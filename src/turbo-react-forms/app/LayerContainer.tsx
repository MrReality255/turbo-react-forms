import { useState, useMemo, ReactNode, useContext } from 'react';
import React from 'react';

import { ctxLayer, ctxLayers } from '../contexts/LayersContext';
import { TLayerContainerProps } from './types';
import { TStateHandle, TWrapperFct } from '../utils';
import { TLayersContext, TLayersState } from '../contexts/types';

export function TLayerContainer({
    mainWrapper = defaultMainWrapper,
    contentWrapper = defaultContentWrapper,
    layerWrapper = defaultLayerWrapper,
    notificationsWrapper = defaultNotificationsWrapper,
    notificationWrapper = defaultNotificationWrapper,
    children,
}: TLayerContainerProps) {
    const ctx = useContext(ctxLayers);

    const [layersState, setLayersState] = useState<TLayersState>({
        layers: [],
        notifications: [],
        maxHandle: ctx ? 1 : 2,
    });

    const newLocalState = useMemo<TStateHandle<TLayersState>>(
        () => ({
            state: layersState,
            setState: setLayersState,
            updateState: setLayersState,
        }),
        [layersState]
    );

    const newLayerCtx = useMemo<TLayersContext>(() => {
        return {
            main: ctx?.main ?? newLocalState,
            local: newLocalState,
        };
    }, [newLocalState]);

    const notifyWrapperFct = notificationsWrapper(layersState.layers.length);

    return mainWrapper(
        <ctxLayers.Provider value={newLayerCtx}>
            {contentWrapper(children)}
            {layersState.layers.map((layer, idx) => {
                const layerFct = layerWrapper(layer.handle, idx + 1);
                const rf = layer.renderFct;
                return (
                    <ctxLayer.Provider
                        value={{ handle: layer.handle }}
                        key={layer.handle}
                    >
                        {layerFct(rf())}
                    </ctxLayer.Provider>
                );
            })}
            {layersState.notifications.length > 0 &&
                notifyWrapperFct(
                    <>
                        {layersState.notifications.map((n, idx) => {
                            const rf = n.renderFct;
                            return (
                                <ctxLayer.Provider
                                    value={{ handle: n.handle }}
                                    key={idx}
                                >
                                    {notificationWrapper(rf())}
                                </ctxLayer.Provider>
                            );
                        })}
                    </>
                )}
        </ctxLayers.Provider>
    );
}

function defaultMainWrapper(content: ReactNode) {
    return (
        <div
            style={{
                position: 'relative',
                width: '100%',
                height: '100%',
                margin: 0,
                padding: 0,
            }}
        >
            {content}
        </div>
    );
}

function defaultContentWrapper(content: ReactNode) {
    return <div style={{ zIndex: 0 }}>{content}</div>;
}

function defaultLayerWrapper(id: number, zIdx: number) {
    return function (c: ReactNode) {
        return (
            <div
                style={{
                    zIndex: zIdx,
                    position: 'absolute',
                    left: '0',
                    top: '0',
                    width: '100%',
                    height: '100%',
                }}
                key={id}
            >
                {c}
            </div>
        );
    };
}

function defaultNotificationsWrapper(layerCount: number): TWrapperFct {
    return (c) => (
        <div
            style={{
                pointerEvents: 'none',
                display: 'flex',
                flexDirection: 'column',
                gap: '1em',
                position: 'absolute',
                left: '0',
                top: '0',
                zIndex: layerCount,
                width: '100%',
            }}
        >
            {c}
        </div>
    );
}

function defaultNotificationWrapper(c: React.ReactNode) {
    return (
        <div
            style={{
                left: '50%',
                position: 'relative',
                transform: 'translate(-50%,0)',
                width: 'fit-content',
                pointerEvents: 'all',
            }}
        >
            {c}
        </div>
    );
}
