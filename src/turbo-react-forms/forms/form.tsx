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
    RP extends object,
>(lib: TFormControlLib<P, V, F, TT, SFT, RP>) {
    return {
        newEmptyList: function <Ctx>() {
            return [] as TFormControlList<P, V, TT, SFT, Ctx, RP>;
        },
        useForm: function <Ctx, SubmitType>(config: TFormConfig<P, V, F, TT, SFT, Ctx, SubmitType, RP>) {
            return useForm<P, V, F, TT, SFT, Ctx, SubmitType, RP>(lib, config);
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
    RP extends object,
>(lib: TFormControlLib<P, V, F, TT, SFT, RP>, config: TFormConfig<P, V, F, TT, SFT, Ctx, SubmitType, RP>) {
    const lc = useLayersOrNull();

    return {
        show: function (data: TDataObjectMap | null, ctx: Ctx, submitFct?: TFormSubmitFct<Ctx, SubmitType>) {
            return new Promise<TFormSubmitCtx<Ctx, SubmitType> | null>((resolve) => {
                const showMethod = lib.showMethod ?? getDefaultShowMethod(lc);
                showMethod((handle) => (
                    <TFormWrapper<P, V, F, TT, SFT, Ctx, SubmitType, RP>
                        config={config}
                        formCtx={ctx}
                        handle={handle}
                        initData={data}
                        initMetaData={{}}
                        lib={lib}
                        onSubmit={submitFct}
                        onResolve={resolve}
                        strictMode
                    ></TFormWrapper>
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
