import { useMemo } from 'react';
import { TDataContainerProps } from '.';
import { ctxDataObject } from '../contexts/DataContext';
import { useNewDataObject } from '../hooks';

export function DataContainer({ children, data, field, idx, onInit }: TDataContainerProps) {
    const dataObj = useNewDataObject({
        initFct: data === undefined ? onInit : undefined,
    });
    const actualObj = useMemo(() => {
        const src = data ?? dataObj;
        if (field !== undefined && idx !== undefined) {
            return src.listGet(field, idx);
        }
        if (field !== undefined) {
            return src.objectGet(field);
        }

        return src;
    }, [data, dataObj, field, idx]);

    return <ctxDataObject.Provider value={actualObj}>{children}</ctxDataObject.Provider>;
}
