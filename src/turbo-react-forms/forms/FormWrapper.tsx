import { useContext, useMemo, useState } from 'react';
import { TFormMode, TFormState, TFormWrapperProps } from '.';
import { ctxForm } from '../contexts/FormContext';
import { TFormContext } from '../contexts/types';
import { TDataObjectMap, useLayer } from '../hooks';
import { FormUtils } from '..';
import { ctxLayer } from '../contexts/LayersContext';

export function TFormWrapper<
    P extends Record<string, unknown>,
    V extends Record<string, unknown>,
    F extends Record<string, unknown>,
    Ctx,
    SubmitType,
>(p: TFormWrapperProps<P, V, F, Ctx, SubmitType>) {
    const { config, formCtx, lib } = p;

    const lctx = useContext(ctxLayer);

    const initState = useMemo(() => {
        return newInitState({});
    }, []);

    const [state, setState] = useState<TFormState<Ctx>>(
        newInitState(
            FormUtils.createInitData(p.initData, p.config, {
                ctx: formCtx,
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
            close: function () {
                const hideMethod = lib.hideMethod ?? lctx?.onClose;
                if (!hideMethod) {
                    throw 'unable to find hide method - use either layers or define hideMethod';
                }
                hideMethod();
                p.onResolve(null);
            },
        };
    }, [state]);

    const mainWrapper = config.onRenderMainWrapper
        ? (content: React.ReactNode) =>
              config.onRenderMainWrapper?.(content, formCtx, state)
        : (content: React.ReactNode) =>
              lib.onRenderMainWrapper(content, config.form);

    return (
        <ctxForm.Provider value={formContext}>
            {mainWrapper(<></>)}
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
