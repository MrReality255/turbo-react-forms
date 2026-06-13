import { PropsWithChildren } from 'react';
import { ctxFormControl } from '../contexts/FormControlContext';
import { TFormControl, TFormSubformPropsType, TFormTemplatePropsType } from '.';

export function TFormControlContainer<
    P extends Record<string, unknown>,
    V extends Record<string, unknown>,
    TT extends TFormTemplatePropsType,
    SFT extends TFormSubformPropsType,
    Ctx,
>(
    p: PropsWithChildren<{ control: TFormControl<P, V, TT, SFT, keyof P, Ctx> }>
) {
    return (
        <ctxFormControl.Provider
            value={{ id: p.control.class !== 'plain' ? p.control.id : '' }}
        >
            {p.children}
        </ctxFormControl.Provider>
    );
}
