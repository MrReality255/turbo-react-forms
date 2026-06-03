import {
    TFormConfig,
    TFormControlLib,
    TFormControlList,
    TFormSubmitCtx,
    TFormSubmitFct,
} from './types';
import { ILayers, TDataObjectMap, useLayersOrNull } from '../hooks';
import { FormWrapper } from './FormWrapper';

export function createFormHook<
    P extends Record<string, unknown>,
    V extends Record<string, unknown>,
>(lib: TFormControlLib<P, V>) {
    return {
        newEmptyList: function <Ctx>() {
            return [] as TFormControlList<P, V, Ctx>;
        },
        useForm: function <Ctx, SubmitType>(
            config: TFormConfig<P, V, Ctx, SubmitType>
        ) {
            return useForm<P, V, Ctx, SubmitType>(lib, config);
        },
    };
}

function useForm<
    P extends Record<string, unknown>,
    V extends Record<string, unknown>,
    Ctx,
    SubmitType,
>(lib: TFormControlLib<P, V>, config: TFormConfig<P, V, Ctx, SubmitType>) {
    const lc = useLayersOrNull();

    return {
        show: function (
            data: TDataObjectMap | null,
            ctx: Ctx,
            submitFct?: TFormSubmitFct<Ctx, SubmitType>
        ) {
            return new Promise<TFormSubmitCtx<Ctx, SubmitType>>((resolve) => {
                const showMethod = lib.showMethod ?? getDefaultShowMethod(lc);
                showMethod((handle) => (
                    <FormWrapper<P, V, Ctx, SubmitType>
                        config={config}
                        formCtx={ctx}
                        handle={handle}
                        initData={data}
                        lib={lib}
                        onSubmit={submitFct}
                        onResolve={resolve}
                    ></FormWrapper>
                ));
            });
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
