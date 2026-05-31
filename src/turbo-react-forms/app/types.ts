import { PropsWithChildren } from 'react';
import { TWrapperFct } from '../utils';
import { IDataObject, TDataObjectMap } from '../hooks';

export type TAppContainerProps = {
    children?: React.ReactNode;
};

export type TDataContainerProps = PropsWithChildren<{
    data?: IDataObject;
    field?: string;
    idx?: number;
    onInit?: () => TDataObjectMap;
}>;

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
