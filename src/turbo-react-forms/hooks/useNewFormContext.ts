import { useContext, useMemo } from 'react';
import { TFormContext } from '../contexts/types';
import {
    TFormError,
    TFormInternalState,
    TFormStateLibCtx,
    TFormSubformPropsType,
    TFormSubmitCtx,
    TFormSubmitFct,
    TFormSubmitFctData,
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
    G extends object = object,
>(
    { state, lib }: TFormStateLibCtx<P, V, F, TT, SFT, Ctx, G>,
    updateFct: (fct: (prev: TFormInternalState<Ctx>) => TFormInternalState<Ctx>) => void,
    onResolve: (ctx: TFormSubmitCtx<Ctx, SubmitType> | null) => void,
    onSubmit: TFormSubmitFct<Ctx, SubmitType> | undefined,
    onError: (err: unknown) => TFormError
) {
    const hideMethodRef = useMemo(() => {
        return DataUtils.newRef((prev: () => void) => prev());
    }, []);
    const lctx = useContext(ctxLayer);

    return useMemo<TFormContext<Ctx, SubmitType>>(() => {
        return {
            ctx: state.ctx,
            data: state.data,
            hideMethodRef,
            close,
            submitEx: handleSubmitResult,
            submit: function (id?: TKey, customData?: unknown) {
                if (!onSubmit) {
                    close();
                    return;
                }
                updateFct((prev) => ({ ...prev, mode: 'loading' }));
                const submitResult = onSubmit({
                    ctx: state.ctx,
                    id: id,
                    rawData: state.data,
                    customData,
                });
                debugger;

                submitResult
                    .then((submitValue) => {
                        handleSubmitResult(submitValue);
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

    function handleSubmitResult(submitValue: TFormSubmitFctData<Ctx, SubmitType>) {
        const newCtx = submitValue.ctxUpdateFct ? submitValue.ctxUpdateFct(state.ctx) : state.ctx;
        if (submitValue.close) {
            hide(() =>
                onResolve(
                    submitValue.cancel
                        ? null
                        : {
                              rawData: submitValue.rawData ?? state.data,
                              ctx: newCtx,
                              submitData: submitValue.submitData,
                              id: submitValue.id,
                          }
                )
            );
            return;
        }
        updateFct((prev) => ({
            ...prev,
            mode: 'ready',
            ctx: newCtx,
            rawData: submitValue.rawData?.getRef() ?? prev.rawData,
        }));
    }

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
