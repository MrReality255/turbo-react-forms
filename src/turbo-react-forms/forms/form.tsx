import {
    TFormConfig,
    TFormControlLib,
    TFormControlList,
    TFormSettings,
    TFormSubformPropsType,
    TFormSubmitCtx,
    TFormSubmitFct,
    TFormTemplatePropsType,
} from '.';
import { ILayers, TDataObjectMap, useLayersOrNull } from '../hooks';
import { TFormWrapper } from './FormWrapper';
import { useFormContext } from '../hooks/useFormContext';
import { TFormContext } from '../contexts/types';

export function createFormHook<
    P extends Record<string, unknown>,
    V extends Record<string, unknown>,
    F extends Record<string, unknown>,
    TT extends TFormTemplatePropsType,
    SFT extends TFormSubformPropsType,
    RP extends object,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    FormEnv = any,
>(lib: TFormControlLib<P, V, F, TT, SFT, RP, FormEnv>) {
    return {
        newEmptyList: function <Ctx>() {
            return [] as TFormControlList<P, V, TT, SFT, Ctx, RP>;
        },
        useForm: function <Ctx, SubmitType>(config: TFormConfig<P, V, F, TT, SFT, Ctx, SubmitType, RP>) {
            return useForm<P, V, F, TT, SFT, Ctx, SubmitType, RP, FormEnv>(lib, config);
        },
        useFormContext: function () {
            return useFormContext() as TFormContext<unknown, unknown, FormEnv>;
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    FormEnv = any,
>(
    lib: TFormControlLib<P, V, F, TT, SFT, RP, FormEnv>,
    config: TFormConfig<P, V, F, TT, SFT, Ctx, SubmitType, RP>,
    formSettings?: TFormSettings
) {
    const lc = useLayersOrNull();

    return {
        show: function (data: TDataObjectMap | null, ctx: Ctx, submitFct?: TFormSubmitFct<Ctx, SubmitType>) {
            return new Promise<TFormSubmitCtx<Ctx, SubmitType> | null>((resolve) => {
                const showMethod = lib.showMethod ?? getDefaultShowMethod(lc);
                showMethod((handle) => (
                    <TFormWrapper<P, V, F, TT, SFT, Ctx, SubmitType, RP, FormEnv>
                        config={config}
                        formCtx={ctx}
                        handle={handle}
                        initData={data}
                        initMetaData={{}}
                        lib={lib}
                        onSubmit={submitFct}
                        onResolve={resolve}
                        strictMode={formSettings?.strictMode ?? true}
                        allowSubmitInvalid={formSettings?.allowSubmitInvalid ?? false}
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
