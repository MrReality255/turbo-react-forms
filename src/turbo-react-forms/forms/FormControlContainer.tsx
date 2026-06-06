import { PropsWithChildren } from 'react';
import { TFormControl } from './types';
import { ctxFormControl } from '../contexts/FormControlContext';

export function TFormControlContainer<
    P extends Record<string, unknown>,
    V extends Record<string, unknown>,
    Ctx,
>(p: PropsWithChildren<{ control: TFormControl<P, V, keyof P, Ctx> }>) {
    return (
        <ctxFormControl.Provider
            value={{ id: p.control.class !== 'plain' ? p.control.id : '' }}
        >
            {p.children}
        </ctxFormControl.Provider>
    );
}
