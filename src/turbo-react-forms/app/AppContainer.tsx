import { TAppContainerProps, TLayerContainerProps } from '.';
import { TLayerContainer } from './LayerContainer';

export function TAppContainer(p: TAppContainerProps & Omit<TLayerContainerProps, 'children'>) {
    return <TLayerContainer {...p}>{p.children}</TLayerContainer>;
}
