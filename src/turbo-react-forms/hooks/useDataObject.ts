import { useContext } from 'react';
import { ctxDataObject } from '../contexts/DataContext';

export function useDataObject() {
    const ctx = useContext(ctxDataObject);
    if (!ctx) {
        throw 'useDataObject must be used within a ctxDataObject provider';
    }
    return ctx;
}
