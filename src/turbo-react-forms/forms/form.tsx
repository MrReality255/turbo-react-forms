import {
    TFormConfig,
    TFormControlLib,
    TFormControlList,
    TFormSubmitCtx,
    TFormSubmitFct,
    TFormTemplatePropsType,
} from '.';
import { ILayers, TDataObjectMap, useLayersOrNull } from '../hooks';
import { TFormWrapper } from './FormWrapper';

export function createFormHook<
    P extends Record<string, unknown>,
    V extends Record<string, unknown>,
    F extends Record<string, unknown>,
    TT extends TFormTemplatePropsType,
>(lib: TFormControlLib<P, V, F, TT>) {
    return {
        newEmptyList: function <Ctx>() {
            return [] as TFormControlList<P, V, TT, Ctx>;
        },
        useForm: function <Ctx, SubmitType>(
            config: TFormConfig<P, V, F, TT, Ctx, SubmitType>
        ) {
            return useForm<P, V, F, TT, Ctx, SubmitType>(lib, config);
        },
    };
}

function useForm<
    P extends Record<string, unknown>,
    V extends Record<string, unknown>,
    F extends Record<string, unknown>,
    TT extends TFormTemplatePropsType,
    Ctx,
    SubmitType,
>(
    lib: TFormControlLib<P, V, F, TT>,
    config: TFormConfig<P, V, F, TT, Ctx, SubmitType>
) {
    const lc = useLayersOrNull();

    return {
        show: function (
            data: TDataObjectMap | null,
            ctx: Ctx,
            submitFct?: TFormSubmitFct<Ctx, SubmitType>
        ) {
            return new Promise<TFormSubmitCtx<Ctx, SubmitType> | null>(
                (resolve) => {
                    const showMethod =
                        lib.showMethod ?? getDefaultShowMethod(lc);
                    showMethod((handle) => (
                        <TFormWrapper<P, V, F, TT, Ctx, SubmitType>
                            config={config}
                            formCtx={ctx}
                            handle={handle}
                            initData={data}
                            lib={lib}
                            onSubmit={submitFct}
                            onResolve={resolve}
                        ></TFormWrapper>
                    ));
                }
            );
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
