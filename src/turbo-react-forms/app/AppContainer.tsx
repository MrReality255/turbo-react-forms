import { TAppContainerProps } from '.';
import { TLayerContainer } from './LayerContainer';

export function TAppContainer(p: TAppContainerProps) {
    return <TLayerContainer>{p.children}</TLayerContainer>;
}
