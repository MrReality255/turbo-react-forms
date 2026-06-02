import { TFormControlLib, TFormControlList, TFormSubmitFct } from './types';
import { ILayers, TDataObjectMap, useLayersOrNull } from '../hooks';
import { FormWrapper } from './FormWrapper';

export function createFormHook<P extends Record<string, unknown>>(
    lib: TFormControlLib<P>
) {
    return {
        emptyList: [] as TFormControlList<P>,
        useForm: function <Ctx, SubmitType>(list: TFormControlList<P>) {
            return useForm<P, Ctx, SubmitType>(lib, list);
        },
    };
}

function useForm<P extends Record<string, unknown>, Ctx, SubmitType>(
    lib: TFormControlLib<P>,
    list: TFormControlList<P>
) {
    const lc = useLayersOrNull();

    return {
        show: async function (
            data: TDataObjectMap | null,
            ctx: Ctx,
            submitFct?: TFormSubmitFct<Ctx, SubmitType>
        ) {
            const showMethod = lib.showMethod ?? getDefaultShowMethod(lc);
            showMethod((handle) => (
                <FormWrapper handle={handle} formCtx={ctx}></FormWrapper>
            ));
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
