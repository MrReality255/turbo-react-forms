import { useContext, useMemo } from 'react';
import { TFormContext } from '../contexts/types';
import {
    TFormError,
    TFormInternalState,
    TFormStateLibCtx,
    TFormSubformPropsType,
    TFormSubmitCtx,
    TFormSubmitFct,
    TFormTemplatePropsType,
} from '../forms';
import { DataUtils, TKey } from '..';
import { ctxLayer } from '../contexts/LayersContext';

export function useNewFormContext<
    P extends Record<string, unknown>,
    V extends Record<string, unknown>,
    F extends Record<string, unknown>,
    TT extends TFormTemplatePropsType,
    SFT extends TFormSubformPropsType,
    Ctx,
    SubmitType,
>(
    { state, lib }: TFormStateLibCtx<P, V, F, TT, SFT, Ctx>,
    updateFct: (fct: (prev: TFormInternalState<Ctx>) => TFormInternalState<Ctx>) => void,
    onResolve: (ctx: TFormSubmitCtx<Ctx, SubmitType> | null) => void,
    onSubmit: TFormSubmitFct<Ctx, SubmitType> | undefined,
    onError: (err: unknown) => TFormError
) {
    const hideMethodRef = useMemo(() => {
        return DataUtils.newRef((prev: () => void) => prev());
    }, []);
    const lctx = useContext(ctxLayer);

    return useMemo<TFormContext<Ctx>>(() => {
        return {
            ctx: state.ctx,
            data: state.data,
            hideMethodRef,
            close,
            submit: function (id?: TKey, customData?: unknown) {
                if (!onSubmit) {
                    close();
                    return;
                }
                debugger;
                updateFct((prev) => ({ ...prev, mode: 'loading' }));
                onSubmit({
                    ctx: state.ctx,
                    id: id,
                    rawData: state.data,
                    customData,
                })
                    .then((submitValue) => {
                        const newCtx = submitValue.ctxUpdateFct ? submitValue.ctxUpdateFct(state.ctx) : state.ctx;
                        if (submitValue.close) {
                            hide(() =>
                                onResolve({
                                    rawData: submitValue.rawData ?? state.data,
                                    ctx: newCtx,
                                    submitData: submitValue.submitData,
                                    id: submitValue.id,
                                })
                            );
                            return;
                        }
                        updateFct((prev) => ({
                            ...prev,
                            mode: 'ready',
                            ctx: newCtx,
                            rawData: submitValue.rawData?.getRef() ?? prev.rawData,
                        }));
                    })
                    .catch((err) => {
                        updateFct((prev) => ({
                            ...prev,
                            mode: 'ready',
                            error: onError(err),
                        }));
                    });
            },
        };
    }, [state, onSubmit, updateFct, hideMethodRef]);

    function hide(callback: () => void) {
        const hideMethod = lib.hideMethod ?? lctx?.hide;
        if (!hideMethod) {
            throw 'unable to find hide method - use either layers or define hideMethod';
        }
        const customHideRef = hideMethodRef.current;
        customHideRef(function () {
            hideMethod();
            callback();
        });
    }

    function close() {
        hide(() => onResolve(null));
    }
}
