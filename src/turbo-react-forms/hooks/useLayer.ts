import { useContext } from 'react';
import { ctxLayer } from '../contexts/LayersContext';

export function useLayer() {
    const ctx = useContext(ctxLayer);
    if (!ctx) {
        throw 'useLayer must be used within a ctxLayer provider';
    }
    return ctx;
}
