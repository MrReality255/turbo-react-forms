import { useState } from 'react';
import { TFormControlLib, TFormControlList, TFormState } from './types';
import { TDataObjectMap, useLayers } from '../hooks';
import { FormWrapper } from './FormWrapper';

export function createFormHook<P extends Record<string, unknown>>(
    lib: TFormControlLib<P>
) {
    return {
        emptyList: [] as TFormControlList<P>,
        useForm: function <Ctx>(list: TFormControlList<P>) {
            return useForm<P, Ctx>(lib, list);
        },
    };
}

function useForm<P extends Record<string, unknown>, Ctx>(
    lib: TFormControlLib<P>,
    list: TFormControlList<P>
) {
    const [state, setState] = useState<TFormState>({
        ctx: null,
        mode: 'ready',
    });
    const lc = useLayers();

    return {
        state,
        setState,
        show: async function (data: TDataObjectMap | null, ctx: Ctx) {
            lc.main.show((handle) => <FormWrapper></FormWrapper>);
        },
    };
}
