import { useContext, useMemo } from 'react';
import { TFormContext } from '../contexts/types';
import {
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
    onSubmit: TFormSubmitFct<Ctx, SubmitType> | undefined
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
                    debugger;
                    close();
                    return;
                }
                updateFct((prev) => ({ ...prev, mode: 'loading' }));
                onSubmit({
                    ctx: state.ctx,
                    id: id,
                    rawData: state.data,
                    customData,
                })
                    .then((submitValue) => {
                        debugger;
                    })
                    .catch((err) => {
                        debugger;
                    });
            },
        };
    }, [state, onSubmit, updateFct, hideMethodRef]);

    function close() {
        const hideMethod = lib.hideMethod ?? lctx?.hide;
        if (!hideMethod) {
            throw 'unable to find hide method - use either layers or define hideMethod';
        }
        const customHideRef = hideMethodRef.current;
        customHideRef(function () {
            hideMethod();
            onResolve(null);
        });
    }
}
