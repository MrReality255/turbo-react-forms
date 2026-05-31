import { useMemo } from 'react';
import { TDataContainerProps } from '.';
import { ctxDataObject } from '../contexts/DataContext';
import { useNewDataObject } from '../hooks';

export function DataContainer({
    children,
    data,
    key,
    idx,
    onInit,
}: TDataContainerProps) {
    const dataObj = useNewDataObject(data === undefined ? onInit : undefined);
    const actualObj = useMemo(() => {
        const src = data ?? dataObj;
        if (key !== undefined && idx !== undefined) {
            return src.listGet(key, idx);
        }
        if (key !== undefined) {
            return src.objectGet(key);
        }

        return src;
    }, [dataObj, key, idx]);

    return (
        <ctxDataObject.Provider value={actualObj}>
            {children}
        </ctxDataObject.Provider>
    );
}
