import { RefObject, useMemo, useRef, useState } from 'react';
import {
    TFormConfig,
    TFormControlLib,
    TFormInternalState,
    TFormMode,
    TFormState,
    TFormStateLibCtx,
    TFormSubformPropsType,
    TFormTemplatePropsType,
    TFormUpdateContext,
    TFormWrapperProps,
} from '.';
import { ctxForm } from '../contexts/FormContext';
import { TDataObject, TDataObjectEvent, TDataObjectMap } from '../hooks';
import { DataObjectUtils, DataUtils, FormUtils } from '..';
import { useNewFormContext } from '../hooks/useNewFormContext';
import { RenderUtils } from './render';
import { TFormContext } from '../contexts/types';

const errUnknown = 'error_unknown';

export function TFormWrapper<
    P extends Record<string, unknown>,
    V extends Record<string, unknown>,
    F extends Record<string, unknown>,
    TT extends TFormTemplatePropsType,
    SFT extends TFormSubformPropsType,
    Ctx,
    SubmitType,
    G extends object = object,
>({ strictMode = false, ...p }: TFormWrapperProps<P, V, F, TT, SFT, Ctx, SubmitType, G>) {
    const { config, formCtx, lib } = p;
    const handleProvider = useMemo(() => {
        return DataUtils.newHandleProvider();
    }, []);

    const initInternalState = useMemo(() => {
        return newFormInternalState({});
    }, []);

    const initState = useMemo(() => {
        return newFormState(initInternalState, () => {}, strictMode);
    }, [initInternalState]);

    const initDataMap = useMemo(() => {
        return FormUtils.createInitData(p.initData, p.initMetaData, p.config, {
            ctx: p.formCtx,
            lib: p.lib,
            state: initState,
        });
    }, [initInternalState]);

    const initializedDataMap = useMemo(() => {
        return newFormInternalState(initDataMap.data);
    }, []);

    const formCtxRef = useRef<TFormContext<Ctx, SubmitType> | null>(null);

    const [internalState, updateInternalState] = useState<TFormInternalState<Ctx>>(initializedDataMap);

    const state = useMemo(() => {
        return newFormState(
            internalState,
            (updateFct, eventInfo) =>
                createUpdateUpdateHandler(updateInternalState, config, eventInfo, updateFct, lib, formCtxRef),
            strictMode
        );
    }, [internalState]);

    const formContext = useNewFormContext(
        {
            state,
            lib,
            ctx: p.formCtx,
        },
        updateInternalState,
        p.onResolve,
        p.onSubmit,
        p.onError ?? ((err) => ({ message: errUnknown, data: err }))
    );

    formCtxRef.current = formContext;
    const formConfig = typeof config.form === 'function' ? config.form(state) : config.form;

    const mainWrapper = config.onRenderMainWrapper
        ? (content: React.ReactNode) => config.onRenderMainWrapper?.(content, formCtx, state)
        : (content: React.ReactNode) => lib.onRenderMainWrapper(content, formConfig);

    return (
        <ctxForm.Provider value={formContext}>
            {mainWrapper(
                RenderUtils.renderContent(
                    FormUtils.createRenderContent(p.config, state),
                    state,
                    lib,
                    config,
                    state.data,
                    FormUtils.getFormControlInheritedProps(state)
                )
            )}
        </ctxForm.Provider>
    );

    function newFormInternalState(rawData: TDataObjectMap): TFormInternalState<Ctx> {
        return {
            error: undefined,
            ctx: p.formCtx,
            handle: p.handle,
            mode: 'ready' as TFormMode,
            section: p.section,
            handleProvider,
            rawData: {
                data: rawData,
                id: handleProvider(),
                type: 'obj',
                metaInfo: {},
            },
        };
    }
}

function newFormState<Ctx>(
    state: TFormInternalState<Ctx>,
    onUpdateData: (fct: (prev: TDataObject) => TDataObject, eventInfo: TDataObjectEvent) => void,
    strictMode: boolean
): TFormState<Ctx> {
    return {
        ...state,
        data: DataObjectUtils.create(
            {
                state: state.rawData,
                updateState: onUpdateData,
            },
            strictMode,
            state.handleProvider
        ),
    };
}

function createUpdateUpdateHandler<
    P extends Record<string, unknown>,
    V extends Record<string, unknown>,
    F extends Record<string, unknown>,
    TT extends TFormTemplatePropsType,
    SFT extends TFormSubformPropsType,
    Ctx,
    SubmitType,
    G extends object = object,
>(
    updateInternalState: (fct: (prev: TFormInternalState<Ctx>) => TFormInternalState<Ctx>) => void,
    config: TFormConfig<P, V, F, TT, SFT, Ctx, SubmitType>,
    eventInfo: TDataObjectEvent,
    updateFct: (prev: TDataObject) => TDataObject,
    lib: TFormControlLib<P, V, F, TT, SFT, G>,
    frmCtxRef: RefObject<TFormContext<Ctx, SubmitType> | null>
): void {
    updateInternalState((prevInternalState) => {
        const newDataObj = updateFct(prevInternalState.rawData);
        const nextState: TFormInternalState<Ctx> = {
            ...prevInternalState,
            rawData: newDataObj,
        };

        if (config.onUpdate) {
            const result = config.onUpdate(null, eventInfo, prevInternalState.ctx, newDataObj);

            if (result && 'then' in result) {
                nextState.mode = 'waiting';
                result.then((newUpdateResult) => {
                    const newNextState: TFormInternalState<Ctx> = {
                        ...nextState,
                        mode: 'ready',
                    };
                    updateNextState(newNextState, newUpdateResult, config, lib, frmCtxRef);
                    updateInternalState(() => newNextState);
                });
                return nextState;
            }

            updateNextState(nextState, result, config, lib, frmCtxRef);
        }

        return nextState;
    });
}
function updateNextState<
    P extends Record<string, unknown>,
    V extends Record<string, unknown>,
    F extends Record<string, unknown>,
    TT extends TFormTemplatePropsType,
    SFT extends TFormSubformPropsType,
    Ctx,
    SubmitType,
    G extends object = object,
>(
    nextState: TFormInternalState<Ctx>,
    updateResult: TFormUpdateContext<Ctx, SubmitType> | undefined,
    config: TFormConfig<P, V, F, TT, SFT, Ctx, SubmitType>,
    lib: TFormControlLib<P, V, F, TT, SFT, G>,
    frmCtxRef: RefObject<TFormContext<Ctx, SubmitType> | null>
) {
    reinitializeRawData(nextState, config, lib);

    if (!updateResult) {
        return;
    }

    if (updateResult.ctx) {
        nextState.ctx = updateResult.ctx;
    }
    if (updateResult.onUpdateData) {
        nextState.rawData = updateResult.onUpdateData(nextState.rawData);
    }
    if (updateResult.modalResult && frmCtxRef.current !== null) {
        frmCtxRef.current.submitEx(updateResult.modalResult);
    }
}

function reinitializeRawData<
    P extends Record<string, unknown>,
    V extends Record<string, unknown>,
    F extends Record<string, unknown>,
    TT extends TFormTemplatePropsType,
    SFT extends TFormSubformPropsType,
    Ctx,
    SubmitType,
    G extends object = object,
>(
    nextState: TFormInternalState<Ctx>,
    config: TFormConfig<P, V, F, TT, SFT, Ctx, SubmitType>,
    lib: TFormControlLib<P, V, F, TT, SFT, G>
) {
    const stateLibCtx: TFormStateLibCtx<P, V, F, TT, SFT, Ctx, G> = {
        ctx: nextState.ctx,
        lib: lib,
        state: {
            ...nextState,
            data: DataObjectUtils.create(
                {
                    state: nextState.rawData,
                    updateState: () => {
                        throw 'this object is read only';
                    },
                },
                false,
                DataUtils.newHandleProvider()
            ),
        },
    };

    const newInitData = FormUtils.createInitData(
        nextState.rawData.data,
        nextState.rawData.metaInfo,
        config,
        stateLibCtx
    );
    nextState.rawData = {
        type: 'obj',
        id: nextState.rawData.id,
        data: newInitData.data,
        metaInfo: newInitData.metaInfo,
    };
}
