import { RefObject, useMemo, useRef, useState } from 'react';
import {
    TFormCommand,
    TFormCommandCtx,
    TFormCommandRec,
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
import { IDataObject, TCommandEvent, TDataObject, TDataObjectEvent, TDataObjectMap } from '../hooks';
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
    RP extends object,
    FormEnv,
>({ strictMode = false, ...p }: TFormWrapperProps<P, V, F, TT, SFT, Ctx, SubmitType, RP, FormEnv>) {
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

    const [formEnv, setFormEnv] = useState<FormEnv>(() => (lib.onInit ? lib.onInit() : (undefined as FormEnv)));

    const state = useMemo(() => {
        return newFormState(
            internalState,
            (updateFct, eventInfo) =>
                handleFormUpdate(updateInternalState, config, eventInfo, updateFct, lib, formCtxRef, strictMode, false),
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
        p.onSubmit ?? config.onSubmit,
        p.onError ?? ((err) => ({ message: errUnknown, data: err })),
        (cmd) => triggerCommand(cmd),
        p.allowSubmitInvalid ?? false,
        formEnv,
        setFormEnv
    );

    formCtxRef.current = formContext;
    const formConfig = typeof config.form === 'function' ? config.form(state, createCommandContext()) : config.form;

    const mainWrapper = config.onRenderMainWrapper
        ? (content: React.ReactNode) => config.onRenderMainWrapper?.(content, formCtx, state)
        : (content: React.ReactNode) => lib.onRenderMainWrapper(content, formConfig, state, formEnv);

    return (
        <ctxForm.Provider value={formContext}>
            {mainWrapper(
                RenderUtils.renderContent(
                    FormUtils.createRenderContent(p.config, state, createCommandContext()),
                    state,
                    lib,
                    config,
                    state.data,
                    FormUtils.getFormControlInheritedProps(state)
                )
            )}
        </ctxForm.Provider>
    );

    function createCommandContext(): TFormCommandCtx {
        return {
            submit: () => formContext.submit(),
            cancel: () => formContext.close(),
            command: (cmd) => formContext.triggerCommand(cmd),
            loading: (loaderFct, onDone) => formContext.triggerLoading(loaderFct, onDone),
        };
    }

    function triggerCommand(cmd: TFormCommand | Promise<TFormCommand>) {
        handleFormUpdate(
            updateInternalState,
            config,
            { type: 'command', cmd: cmd },
            (prev) => prev,
            lib,
            formCtxRef,
            strictMode,
            false
        );
    }

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

function handleFormUpdate<
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
    updateInternalState: (fct: (prev: TFormInternalState<Ctx>) => TFormInternalState<Ctx>) => void,
    config: TFormConfig<P, V, F, TT, SFT, Ctx, SubmitType, RP, FormEnv>,
    eventInfo: TDataObjectEvent | TCommandEvent,
    updateFct: (prev: TDataObject) => TDataObject,
    lib: TFormControlLib<P, V, F, TT, SFT, RP, FormEnv>,
    frmCtxRef: RefObject<TFormContext<Ctx, SubmitType> | null>,
    strictMode: boolean,
    resetReady: boolean
): void {
    updateInternalState((prevInternalState) => {
        const newDataObj = updateFct(prevInternalState.rawData);
        const nextState: TFormInternalState<Ctx> = {
            ...prevInternalState,
            rawData: newDataObj,
        };

        if (resetReady) {
            nextState.mode = 'ready';
        }

        if (eventInfo.type == 'command' && eventInfo.cmd instanceof Promise) {
            // process the promise
            eventInfo.cmd.then((actualCmd) => {
                handleFormUpdate(
                    updateInternalState,
                    config,
                    { type: 'command', cmd: actualCmd },
                    updateFct,
                    lib,
                    frmCtxRef,
                    strictMode,
                    true
                );
            });
            // put the window into the loading mode
            nextState.mode = 'loading';
            return nextState;
        }

        if (config.onUpdate) {
            const result = config.onUpdate(
                eventInfo.type == 'command' && !(eventInfo.cmd instanceof Promise)
                    ? createCommandRec(eventInfo.cmd)
                    : null,
                eventInfo.type != 'command' ? eventInfo : null,
                prevInternalState.ctx,
                newDataObj
            );

            if (result && 'then' in result) {
                nextState.mode = 'waiting';
                result
                    .then((newUpdateResult) => {
                        updateInternalState((prevState) => {
                            const newNextState: TFormInternalState<Ctx> = {
                                ...prevState,
                                mode: 'ready',
                            };
                            updateNextState(newNextState, newUpdateResult, config, lib, frmCtxRef, strictMode);
                            return newNextState;
                        });
                    })
                    .catch((err) => {
                        throw 'form update failed: ' + err;
                    });
                return nextState;
            }

            updateNextState(nextState, result, config, lib, frmCtxRef, strictMode);
        } else {
            updateNextState(nextState, {}, config, lib, frmCtxRef, strictMode);
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
    RP extends object,
    FormEnv,
>(
    nextState: TFormInternalState<Ctx>,
    updateResult: TFormUpdateContext<Ctx, SubmitType, FormEnv> | undefined,
    config: TFormConfig<P, V, F, TT, SFT, Ctx, SubmitType, RP, FormEnv>,
    lib: TFormControlLib<P, V, F, TT, SFT, RP, FormEnv>,
    frmCtxRef: RefObject<TFormContext<Ctx, SubmitType> | null>,
    strictMode: boolean
) {
    reinitializeRawData(nextState, config, lib);

    if (!updateResult) {
        return;
    }

    if (updateResult.ctx) {
        nextState.ctx = updateResult.ctx;
    }
    if (updateResult.onUpdateData) {
        nextState.rawData = updateResult.onUpdateData(nextState.rawData, (fct: (x: IDataObject) => void) => {
            const r = DataObjectUtils.updateObject(nextState.rawData, strictMode, nextState.handleProvider, fct);
            return r(nextState.rawData);
        });
        reinitializeRawData(nextState, config, lib);
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
    RP extends object,
    FormEnv,
>(
    nextState: TFormInternalState<Ctx>,
    config: TFormConfig<P, V, F, TT, SFT, Ctx, SubmitType, RP, FormEnv>,
    lib: TFormControlLib<P, V, F, TT, SFT, RP, FormEnv>
) {
    const stateLibCtx: TFormStateLibCtx<P, V, F, TT, SFT, Ctx, RP, FormEnv> = {
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

function createCommandRec(cmd: TFormCommand): TFormCommandRec {
    return typeof cmd === 'string' ? { id: cmd } : cmd;
}
