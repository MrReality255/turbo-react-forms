import { useMemo, useState } from 'react';
import { TFormMode, TFormState, TFormWrapperProps } from '.';
import { ctxForm } from '../contexts/FormContext';
import { TFormContext } from '../contexts/types';
import { TDataObjectMap } from '../hooks';
import { FormUtils } from '..';

export function FormWrapper<
    P extends Record<string, unknown>,
    V extends Record<string, unknown>,
    Ctx,
    SubmitType,
>(p: TFormWrapperProps<P, V, Ctx, SubmitType>) {
    const initState = useMemo(() => {
        return newInitState({});
    }, []);

    const [state, setState] = useState<TFormState<Ctx>>(
        newInitState(
            FormUtils.createInitData(p.initData, p.config, {
                ctx: p.formCtx,
                lib: p.lib,
                state: initState,
            })
        )
    );

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
            <h1>Form wrapper</h1>
            <div>{p.children}</div>
        </ctxForm.Provider>
    );

    function newInitState(rawData: TDataObjectMap) {
        return {
            ctx: p.formCtx,
            handle: p.handle,
            mode: 'ready' as TFormMode,
            section: p.section,
            rawData,
        };
    }
}
