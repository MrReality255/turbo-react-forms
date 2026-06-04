import { PropsWithChildren, useContext } from 'react';
import { TLayerProps } from './types';
import { ctxLayer } from '../contexts/LayersContext';

export function TLayer(props: PropsWithChildren<TLayerProps>) {
    const { children } = props;
    const ctx = useContext(ctxLayer);
    if (ctx === undefined) {
        throw 'unable to find parent layer context (with handle)';
    }

    return (
        <ctxLayer.Provider
            value={{
                handle: ctx.handle,
                hide: props.onHide ? () => props.onHide!(ctx.hide) : ctx.hide,
            }}
        >
            {children}
        </ctxLayer.Provider>
    );
}
