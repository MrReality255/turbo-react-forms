import { useState, useMemo, ReactNode } from 'react'
import { ctxLayers, TLayerRec } from '../contexts/AppLayers'
import { TLayerContainerProps } from './types'

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

export function TLayerContainer({
    mainWrapper = defaultMainWrapper,
    contentWrapper = defaultContentWrapper,
    layerWrapper = defaultLayerWrapper,
    children,
}: TLayerContainerProps) {
    const [layers, setLayers] = useState<TLayerRec[]>([])

    const contextValue = useMemo(
        () => ({ layers, updateLayers: setLayers }),
        [layers]
    )

    return mainWrapper(
        <ctxLayers.Provider value={contextValue}>
            {contentWrapper(children)}
            {layers.map((layer, idx) => {
                const layerFct = layerWrapper(layer.handle, idx + 1)
                return layerFct(layer.renderFct())
            })}
        </ctxLayers.Provider>
    )
}
