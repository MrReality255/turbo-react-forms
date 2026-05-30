import { TWrapperFct } from '../utils';

export type TAppContainerProps = {
    children?: React.ReactNode;
};

export type TLayerContainerProps = {
    mainWrapper?: TWrapperFct;
    contentWrapper?: TWrapperFct;
    layerWrapper?: (key: number, zIdx: number) => TWrapperFct;
    notificationsWrapper?: (layerCount: number) => TWrapperFct;
    notificationWrapper?: TWrapperFct;
    children?: React.ReactNode;
};

export type TLayerProps = {
    data?: unknown;
    onClose?: () => void;
};
