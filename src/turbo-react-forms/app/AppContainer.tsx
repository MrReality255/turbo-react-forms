import { TAppContainerProps } from './index';
import { TLayerContainer } from './LayerContainer';

export function TAppContainer(p: TAppContainerProps) {
    return <TLayerContainer>{p.children}</TLayerContainer>;
}
