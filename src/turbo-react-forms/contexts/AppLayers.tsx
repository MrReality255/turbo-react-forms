import { createContext } from 'react'

export type TLayerRec = {
    handle: number
    renderFct: () => React.ReactNode
}

export type TLayerState = {
    layers: TLayerRec[]
    notifications: TLayerRec[]
}

export type TLayerRecs = {
    layers: TLayerRec[]
    notifications: TLayerRec[]
    updateLayers: (updater: (old: TLayerRec[]) => TLayerRec[]) => void
    updateNotifications: (updater: (old: TLayerRec[]) => TLayerRec[]) => void
}

export const ctxLayers = createContext<TLayerRecs | null>(null)
