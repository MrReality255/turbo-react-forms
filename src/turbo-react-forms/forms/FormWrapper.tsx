import { useMemo, useState } from 'react';
import { TFormState, TFormWrapperProps } from '.';
import { ctxForm } from '../contexts/FormContext';
import { TFormContext } from '../contexts/types';

export function FormWrapper<Ctx>(p: TFormWrapperProps<Ctx>) {
    const [state, setState] = useState<TFormState<Ctx>>({
        ctx: p.formCtx,
        handle: p.handle,
        mode: 'ready',
    });

    const formContext = useMemo<TFormContext<Ctx>>(() => {
        return {
            stateHandle: {
                state,
                updateState: setState,
            },
        };
    }, [state]);

    return (
        <ctxForm.Provider value={formContext}>
            <div>{p.children}</div>
        </ctxForm.Provider>
    );
}
