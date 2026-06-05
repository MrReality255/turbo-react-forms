import { useMemo, useState } from 'react';
import { TFormMode, TFormState, TFormWrapperProps } from '.';
import { ctxForm } from '../contexts/FormContext';
import { TDataObjectMap } from '../hooks';
import { FormUtils } from '..';
import { useNewFormContext } from '../hooks/useNewFormContext';
import { RenderUtils } from './render';

export function TFormWrapper<
    P extends Record<string, unknown>,
    V extends Record<string, unknown>,
    F extends Record<string, unknown>,
    Ctx,
    SubmitType,
>(p: TFormWrapperProps<P, V, F, Ctx, SubmitType>) {
    const { config, formCtx, lib } = p;

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

    const formContext = useNewFormContext(
        {
            ctx: p.formCtx,
            lib: p.lib,
            state,
            updateState: setState,
        },
        p.onResolve
    );

    const mainWrapper = config.onRenderMainWrapper
        ? (content: React.ReactNode) =>
              config.onRenderMainWrapper?.(content, formCtx, state)
        : (content: React.ReactNode) =>
              lib.onRenderMainWrapper(content, config.form);

    return (
        <ctxForm.Provider value={formContext}>
            {mainWrapper(
                RenderUtils.renderContent(
                    FormUtils.createRenderContent(p.config, state),
                    state,
                    state.rawData
                )
            )}
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
