import { useContext, useMemo } from 'react';
import { TFormContext } from '../contexts/types';
import { TFormStateHandleLibCtx, TFormSubmitCtx } from '../forms';
import { DataUtils } from '..';
import { ctxLayer } from '../contexts/LayersContext';

export function useNewFormContext<
    P extends Record<string, unknown>,
    V extends Record<string, unknown>,
    F extends Record<string, unknown>,
    Ctx,
    SubmitType,
>(
    { state, lib, updateState }: TFormStateHandleLibCtx<P, V, F, Ctx>,
    onResolve: (ctx: TFormSubmitCtx<Ctx, SubmitType> | null) => void
) {
    const hideMethodRef = useMemo(() => {
        return DataUtils.newRef((prev: () => void) => prev());
    }, []);
    const lctx = useContext(ctxLayer);

    return useMemo<TFormContext<Ctx>>(() => {
        return {
            stateHandle: {
                state,
                updateState: updateState,
            },
            hideMethodRef,
            close: function () {
                const hideMethod = lib.hideMethod ?? lctx?.hide;
                if (!hideMethod) {
                    throw 'unable to find hide method - use either layers or define hideMethod';
                }
                const customHideRef = hideMethodRef.current;
                customHideRef(function () {
                    hideMethod();
                    onResolve(null);
                });
            },
        };
    }, [state]);
}
