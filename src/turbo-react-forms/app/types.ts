import { TWrapperFct } from '../utils';

export type TAppContainerProps = {
  children?: React.ReactNode;
};

export type TLayerContainerProps = {
  mainWrapper?: TWrapperFct;
  contentWrapper?: TWrapperFct;
  layerWrapper?: (key: number, zIdx: number) => TWrapperFct;
  children?: React.ReactNode;
};
