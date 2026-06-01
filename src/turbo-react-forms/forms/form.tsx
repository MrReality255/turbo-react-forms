import { useState } from 'react';
import { TFormControlLib, TFormControlList, TFormState } from './types';
import { ILayers, TDataObjectMap, useLayersOrNull } from '../hooks';
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
    const lc = useLayersOrNull();

    return {
        state,
        setState,
        show: async function (data: TDataObjectMap | null, ctx: Ctx) {
            const showMethod = lib.showMethod ?? getDefaultShowMethod(lc);
            showMethod((handle) => <FormWrapper handle={handle}></FormWrapper>);
        },
    };
}
function getDefaultShowMethod(lc: ILayers | null) {
    return function (contentProvider: (handle: number) => React.ReactNode) {
        if (!lc) {
            throw 'you need to use layer manager without default show method';
        }
        lc.main.show((handle) => contentProvider(handle));
    };
}
