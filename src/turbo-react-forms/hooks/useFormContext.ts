import { useContext } from 'react';
import { ctxForm } from '../contexts/FormContext';

export function useFormContext() {
    const ctx = useContext(ctxForm);
    if (!ctx) {
        throw 'useFormContext must be used within a ctxForm provider';
    }
    return ctx;
}
