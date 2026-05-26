import { useState, useMemo, ReactNode, PropsWithChildren } from 'react'
import {
    ctxLayers,
    TLayerRec,
    TLayerRecs,
    TLayerState,
} from '../contexts/AppLayers'
import { TLayerContainerProps } from './types'
import { TWrapperFct } from '../utils'
import React from 'react'

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
    )
}

function defaultContentWrapper(content: ReactNode) {
    return <div style={{ zIndex: 0 }}>{content}</div>
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
        )
    }
}

function defaultNotificationsWrapper(layerCount: number): TWrapperFct {
    return (c) => (
        <div
            style={{
                position: 'absolute',
                left: '0',
                top: '0',
                width: '100%',
                height: 'auto',
                zIndex: layerCount,
            }}
        >
            {c}
        </div>
    )
}

export function TLayerContainer({
    mainWrapper = defaultMainWrapper,
    contentWrapper = defaultContentWrapper,
    layerWrapper = defaultLayerWrapper,
    notificationsWrapper = defaultNotificationsWrapper,
    children,
}: TLayerContainerProps) {
    const [layersState, setLayersState] = useState<TLayerState>({
        layers: [],
        notifications: [],
    })

    const contextValue = useMemo<TLayerRecs>(
        () => ({
            layers: layersState.layers,
            notifications: layersState.notifications,
            updateLayers: (updater) => {
                setLayersState({
                    ...layersState,
                    layers: updater(layersState.layers),
                })
            },
            updateNotifications: (updater) => {
                setLayersState({
                    ...layersState,
                    notifications: updater(layersState.notifications),
                })
            },
        }),
        [layersState]
    )

    const notifyWrapperFct = notificationsWrapper(layersState.layers.length)

    return mainWrapper(
        <ctxLayers.Provider value={contextValue}>
            {contentWrapper(children)}
            {layersState.layers.map((layer, idx) => {
                const layerFct = layerWrapper(layer.handle, idx + 1)
                return layerFct(layer.renderFct())
            })}
            {layersState.notifications.length > 0 &&
                notifyWrapperFct(
                    <>
                        {layersState.notifications.map((n, idx) => {
                            return (
                                <React.Fragment key={idx}>
                                    {n.renderFct()}
                                </React.Fragment>
                            )
                        })}
                    </>
                )}
        </ctxLayers.Provider>
    )
}
