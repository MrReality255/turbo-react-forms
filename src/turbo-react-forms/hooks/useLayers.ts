import { useLayersOrNull } from './useLayersOrNull';

export function useLayers() {
    const l = useLayersOrNull();
    if (!l) {
        throw new Error('useLayers must be used within a ctxLayers provider');
    }
    return l;
}
