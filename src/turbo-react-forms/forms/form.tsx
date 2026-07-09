import {
    TFormConfig,
    TFormControlLib,
    TFormControlList,
    TFormSubformPropsType,
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
    SFT extends TFormSubformPropsType,
>(lib: TFormControlLib<P, V, F, TT, SFT>) {
    return {
        newEmptyList: function <Ctx>() {
            return [] as TFormControlList<P, V, TT, SFT, Ctx>;
        },
        useForm: function <Ctx, SubmitType>(
            config: TFormConfig<P, V, F, TT, SFT, Ctx, SubmitType>
        ) {
            return useForm<P, V, F, TT, SFT, Ctx, SubmitType>(lib, config);
        },
    };
}

function useForm<
    P extends Record<string, unknown>,
    V extends Record<string, unknown>,
    F extends Record<string, unknown>,
    TT extends TFormTemplatePropsType,
    SFT extends TFormSubformPropsType,
    Ctx,
    SubmitType,
>(
    lib: TFormControlLib<P, V, F, TT, SFT>,
    config: TFormConfig<P, V, F, TT, SFT, Ctx, SubmitType>
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
                        <TFormWrapper<P, V, F, TT, SFT, Ctx, SubmitType>
                            config={config}
                            formCtx={ctx}
                            handle={handle}
                            initData={data}
                            lib={lib}
                            onSubmit={submitFct}
                            onResolve={resolve}
                            strictMode
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
