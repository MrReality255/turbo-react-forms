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
    FormEnv,
>(lib: TFormControlLib<P, V, F, TT, SFT, RP, FormEnv>) {
    return {
        newEmptyList: function <Ctx>() {
            return [] as TFormControlList<P, V, TT, SFT, Ctx, RP>;
        },
        useForm: function <Ctx, SubmitType>(config: TFormConfig<P, V, F, TT, SFT, Ctx, SubmitType, RP, FormEnv>) {
            return useForm<P, V, F, TT, SFT, Ctx, SubmitType, RP, FormEnv>(lib, config);
        },
        useFormContext: function () {
            return useFormContext() as TFormContext<unknown, unknown, FormEnv>;
        },
        Form: function <Ctx, SubmitType = never>({
            config,
            ctx,
            handle,
            data,
            formSettings,
            onResolve,
            onSubmit,
        }: {
            config: TFormConfig<P, V, F, TT, SFT, Ctx, SubmitType, RP, FormEnv>;
            ctx: Ctx;
            handle?: number;
            data: TDataObjectMap | null;
            formSettings?: TFormSettings;
            onSubmit?: TFormSubmitFct<Ctx, SubmitType, FormEnv>;
            onResolve?: (ctx: TFormSubmitCtx<Ctx, SubmitType> | null) => void;
        }) {
            const frm = useForm(lib, config, formSettings);
            return frm.render(false, data, ctx, {
                handle,
                onResolve,
                onSubmit,
            });
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
    FormEnv,
>(
    lib: TFormControlLib<P, V, F, TT, SFT, RP, FormEnv>,
    config: TFormConfig<P, V, F, TT, SFT, Ctx, SubmitType, RP, FormEnv>,
    formSettings?: TFormSettings
) {
    const lc = useLayersOrNull();

    return {
        render,
        show: function (data: TDataObjectMap | null, ctx: Ctx, submitFct?: TFormSubmitFct<Ctx, SubmitType, FormEnv>) {
            return new Promise<TFormSubmitCtx<Ctx, SubmitType> | null>((resolve) => {
                const showMethod = lib.showMethod ?? getDefaultShowMethod(lc);
                showMethod((handle) =>
                    render(true, data, ctx, {
                        handle,
                        onResolve: resolve,
                        onSubmit: submitFct,
                    })
                );
            });
        },
    };

    function render(
        inContainer: boolean,
        data: TDataObjectMap | null,
        ctx: Ctx,
        options: {
            handle?: number;
            onSubmit?: TFormSubmitFct<Ctx, SubmitType, FormEnv>;
            onResolve?: (ctx: TFormSubmitCtx<Ctx, SubmitType> | null) => void;
        }
    ) {
        return (
            <TFormWrapper<P, V, F, TT, SFT, Ctx, SubmitType, RP, FormEnv>
                config={config}
                formCtx={ctx}
                handle={options?.handle}
                initData={data}
                initMetaData={{}}
                lib={lib}
                onSubmit={options?.onSubmit}
                onResolve={options?.onResolve}
                strictMode={formSettings?.strictMode ?? true}
                allowSubmitInvalid={formSettings?.allowSubmitInvalid ?? false}
                inContainer={inContainer}
            ></TFormWrapper>
        );
    }
}

function getDefaultShowMethod(lc: ILayers | null) {
    return function (contentProvider: (handle: number) => React.ReactNode) {
        if (!lc) {
            throw 'you need to use layer manager without default show method';
        }
        lc.main.show((handle) => contentProvider(handle));
    };
}
