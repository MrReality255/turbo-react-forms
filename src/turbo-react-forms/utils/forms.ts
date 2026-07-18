import {
    DataObjectUtils,
    DataUtils,
    TDataObject,
    TDataObjectMap,
    TDataObjectMetaMap,
    TFormConfig,
    TFormControl,
    TFormControlInheritedStateProps,
    TFormControlList,
    TFormControlSpecificProps,
    TFormControlAtomic,
    TFormControlSubform,
    TFormControlTemplate,
    TFormInternalState,
    TFormState,
    TFormStateLibCtx,
    TFormSubformPropsType,
    TFormTemplatePropsType,
    THandleProvider,
    TValidity,
} from '..';

export const FormUtils = {
    createInitData,
    createRenderContent,
    getControlID,
    getControlProps,
    getFormControlInheritedProps,
    validate,
    wrap,
};

function createInitData<
    P extends Record<string, unknown>,
    V extends Record<string, unknown>,
    F extends Record<string, unknown>,
    TT extends TFormTemplatePropsType,
    SFT extends TFormSubformPropsType,
    Ctx,
    SubmitType,
>(
    initData: TDataObjectMap | null,
    initMetaData: TDataObjectMetaMap | null,
    config: TFormConfig<P, V, F, TT, SFT, Ctx, SubmitType>,
    stateLibCtx: TFormStateLibCtx<P, V, F, TT, SFT, Ctx>
): { data: TDataObjectMap, metaInfo: TDataObjectMetaMap } {
    initData = initData ?? {};
    const myControlList =
        typeof config.controls === 'function'
            ? config.controls(stateLibCtx.state)
            : config.controls;

    const result: TDataObjectMap = {};
    const resultMetaData: TDataObjectMetaMap = {}

    createInitDataForControlList<P, V, F, TT, SFT, Ctx>(
        result,
        resultMetaData,
        myControlList.filter((item) => item !== null),
        initData,
        initMetaData ?? {},
        stateLibCtx,
        DataUtils.newHandleProvider(),
        getFormControlInheritedProps(stateLibCtx.state)
    );
    return {
        data: result,
        metaInfo: resultMetaData
    }
}

function createInitDataForControlList<
    P extends Record<string, unknown>,
    V extends Record<string, unknown>,
    F extends Record<string, unknown>,
    TT extends TFormTemplatePropsType,
    SFT extends TFormSubformPropsType,
    Ctx,
>(
    result: TDataObjectMap,
    resultMetaData: TDataObjectMetaMap,
    controlList: TFormControl<P, V, TT, SFT, keyof P, Ctx>[],
    initData: TDataObjectMap,
    initMetaData: TDataObjectMetaMap,
    stateLibCtx: TFormStateLibCtx<P, V, F, TT, SFT, Ctx>,
    handleProvider: THandleProvider,
    inheritedStateProps: TFormControlInheritedStateProps
) {
    controlList.forEach((control) => {
        createInitDataForControl(
            result,
            resultMetaData,
            control,
            initData,
            initMetaData,
            stateLibCtx,
            handleProvider,
            inheritedStateProps,
        );
    });
}

function createInitDataForControl<
    P extends Record<string, unknown>,
    V extends Record<string, unknown>,
    F extends Record<string, unknown>,
    TT extends TFormTemplatePropsType,
    SFT extends TFormSubformPropsType,
    Ctx,
>(
    result: TDataObjectMap,
    resultMetaData: TDataObjectMetaMap,
    control: TFormControl<P, V, TT, SFT, keyof P, Ctx>,
    initData: TDataObjectMap,
    initMetaData: TDataObjectMetaMap,
    stateLibCtx: TFormStateLibCtx<P, V, F, TT, SFT, Ctx>,
    handleProvider: THandleProvider,
    inheritedStateProps: TFormControlInheritedStateProps,
) {
    if (control.class == 'plain' || control.removed) {
        return;
    }

    switch (control.class) {
        case 'template':
            createInitDataForTemplate<P, V, F, TT, SFT, Ctx>(
                result,
                control,
                initData,
                stateLibCtx,
                handleProvider,
                inheritedStateProps,
            );
            return;
        case 'subform':
            createInitDataForSubform(
                result,
                resultMetaData,
                control,
                initData,
                initMetaData,
                stateLibCtx,
                handleProvider,
                inheritedStateProps,
            );
            return;
        default:
            createInitDataStringControl(result, control, initData, stateLibCtx, inheritedStateProps);
            return;
    }
}

function createInitDataForTemplate<
    P extends Record<string, unknown>,
    V extends Record<string, unknown>,
    F extends Record<string, unknown>,
    TT extends TFormTemplatePropsType,
    SFT extends TFormSubformPropsType,
    Ctx,
>(
    result: TDataObjectMap,
    control: TFormControlTemplate<P, V, TT, SFT, Ctx>,
    initData: TDataObjectMap,
    stateLibCtx: TFormStateLibCtx<P, V, F, TT, SFT, Ctx>,
    handleProvider: THandleProvider,
    inheritedProps: TFormControlInheritedStateProps,
) {
    inheritedProps = combineInheritedProps(inheritedProps, control);

    const template = control.template;
    const initList = DataObjectUtils.getList(() => initData[control.id]) ?? {
        type: 'list',
        items: [],
    };

    if (initList.items.length > 0) {
        DataUtils.shiftHandleProvider(handleProvider, initList.items.map(a => a.id).reduce((a, b) => Math.max(a, b), 0))
    }

    const items = initList.items
        .filter(
            (_item, idx) =>
                template.maxCount == undefined || idx < template.maxCount
        )
        .map((item, idx) => {
            const newObj: TDataObject = {
                type: 'obj',
                data: {},
                id: item.id || handleProvider(),
                metaInfo: {}
            };

            createInitDataForSubform(
                newObj.data,
                newObj.metaInfo,
                newTemplateSubForm(control, idx, newObj.id, stateLibCtx),
                item.data,
                item.metaInfo,
                stateLibCtx,
                handleProvider,
                inheritedProps,

            );
            return newObj;
        });

    // create new items to reach the minimum
    if (template.minCount && items.length < template.minCount) {
        for (let i = items.length; i < template.minCount; i++) {
            items.push(
                newTemplateItem(control, i, stateLibCtx, handleProvider, inheritedProps)
            );
        }
    }

    result[control.id] = {
        type: 'list',
        items,
    };
}

function createInitDataForSubform<
    P extends Record<string, unknown>,
    V extends Record<string, unknown>,
    F extends Record<string, unknown>,
    TT extends TFormTemplatePropsType,
    SFT extends TFormSubformPropsType,
    Ctx,
>(
    result: TDataObjectMap,
    resultMetaData: TDataObjectMetaMap,
    control: TFormControlSubform<P, V, TT, SFT, Ctx>,
    initData: TDataObjectMap,
    initMetaData: TDataObjectMetaMap,
    stateLibCtx: TFormStateLibCtx<P, V, F, TT, SFT, Ctx>,
    handleProvider: THandleProvider,
    inheritedProps: TFormControlInheritedStateProps
) {
    if (control.useOwnDataObject) {
        const initObj = (initData[control.id] as TDataObject | undefined)
        DataUtils.shiftHandleProvider(handleProvider, initObj?.id ?? 0)
        result[control.id] = { type: 'obj', data: {}, id: initObj?.id ?? 0, metaInfo: { ...(initObj?.metaInfo ?? {}) } };
    }
    const srcDataObject =
        (control.useOwnDataObject
            ? (initData[control.id] as TDataObject)?.data
            : initData) ?? {};

    const srcMetaData = { ...(control.useOwnDataObject ? ((initData[control.id] as TDataObject)?.metaInfo ?? {}) : { ...initMetaData }) }

    const targetObj = control.useOwnDataObject
        ? (result[control.id] as TDataObject).data
        : result;

    const targetMetaData = control.useOwnDataObject
        ? (result[control.id] as TDataObject).metaInfo
        : resultMetaData;

    Object.entries(srcMetaData).forEach(([key, value]) => {
        targetMetaData[key] = value;
    });

    const listFct =
        typeof control.subform.controls === 'function'
            ? control.subform.controls
            : () =>
                control.subform.controls as TFormControlList<
                    P,
                    V,
                    TT,
                    SFT,
                    Ctx
                >;

    const actualList = listFct(
        stateLibCtx.state,
        DataObjectUtils.create(
            {
                state: { data: {}, id: 0, type: 'obj', metaInfo: { ...(initMetaData ?? {}) } },
                updateState: () => { },
            },
            true,
            () => 0
        )
    ).filter((item) => item !== null);

    createInitDataForControlList(
        targetObj,
        targetMetaData,
        actualList,
        srcDataObject,
        srcMetaData,
        stateLibCtx,
        handleProvider,
        combineInheritedProps(inheritedProps, control),
    );
}

function createInitDataStringControl<
    P extends Record<string, unknown>,
    V extends Record<string, unknown>,
    F extends Record<string, unknown>,
    TT extends TFormTemplatePropsType,
    SFT extends TFormSubformPropsType,
    Ctx,
>(
    result: TDataObjectMap,
    control: TFormControlAtomic<P, V, keyof P, Ctx>,
    initData: TDataObjectMap,
    stateLibCtx: TFormStateLibCtx<P, V, F, TT, SFT, Ctx>,
    inheritedStateProps: TFormControlInheritedStateProps,
) {
    const controlDef = control.class !== 'custom' ? stateLibCtx.lib.controls[control.type] : undefined
    const rawValue =
        DataObjectUtils.getRawValue(() => initData[control.id], false) ||
        control.defaultValue || controlDef?.forcedDefaultValue || '';

    result[control.id] = DataObjectUtils.newValue(
        rawValue,
        validate(rawValue, control, stateLibCtx, inheritedStateProps)
    );
}

function combineInheritedProps(
    owner: TFormControlInheritedStateProps, ctrlProps: Partial<TFormControlInheritedStateProps>,
): TFormControlInheritedStateProps {
    return {
        disabled: ctrlProps.disabled || owner.disabled || false,
        hidden: ctrlProps.hidden || owner.hidden || false,
        readOnly: ctrlProps.readOnly || owner.readOnly || false,
        removed: ctrlProps.removed || owner.removed || false,
    }
}

function isUnavailable(props: TFormControlInheritedStateProps) {
    return props.disabled || props.hidden || props.readOnly || props.removed
}

function validate<
    P extends Record<string, unknown>,
    V extends Record<string, unknown>,
    F extends Record<string, unknown>,
    TT extends TFormTemplatePropsType,
    SFT extends TFormSubformPropsType,
    Ctx,
>(
    value: string,
    control: TFormControlAtomic<P, V, keyof P, Ctx>,
    stateLibCtx: TFormStateLibCtx<P, V, F, TT, SFT, Ctx>,
    inheritedProps: TFormControlInheritedStateProps
): TValidity {
    inheritedProps = combineInheritedProps(inheritedProps, control)
    const unavailable = isUnavailable(inheritedProps)
    const optional = control.optional || unavailable
    if (unavailable) {
        return true
    }
    if (!value) {
        return optional;
    }

    if (control.onValidate) {
        const v = control.onValidate(value, stateLibCtx.ctx);
        if (v !== true) {
            return v;
        }
    }

    if (control.class === 'dynamic') {
        return true;
    }

    if (control.validation) {
        const validatorFct = stateLibCtx.lib.validators?.[control.validation];
        if (validatorFct) {
            const validationFctResult = validatorFct(
                value,
                control.class !== 'custom' ? control.prop : null
            );
            if (validationFctResult !== true) {
                return validationFctResult;
            }
        }
    }
    return true;
}
function newTemplateItem<
    P extends Record<string, unknown>,
    V extends Record<string, unknown>,
    F extends Record<string, unknown>,
    TT extends TFormTemplatePropsType,
    SFT extends TFormSubformPropsType,
    Ctx,
>(
    control: TFormControlTemplate<P, V, TT, SFT, Ctx>,
    idx: number,
    stateLibCtx: TFormStateLibCtx<P, V, F, TT, SFT, Ctx>,
    handleProvider: THandleProvider,
    inheritedProps: TFormControlInheritedStateProps
): TDataObject {
    const newObj: TDataObject = {
        type: 'obj',
        id: handleProvider(),
        data: {},
        metaInfo: {}
    };

    createInitDataForSubform(
        newObj.data,
        newObj.metaInfo,
        newTemplateSubForm(control, idx, newObj.id, stateLibCtx),
        {}, {},
        stateLibCtx,
        handleProvider,
        combineInheritedProps(inheritedProps, control)
    );

    return newObj;
}

function newTemplateSubForm<
    P extends Record<string, unknown>,
    V extends Record<string, unknown>,
    F extends Record<string, unknown>,
    TT extends TFormTemplatePropsType,
    SFT extends TFormSubformPropsType,
    Ctx,
>(
    control: TFormControlTemplate<P, V, TT, SFT, Ctx>,
    idx: number,
    handle: number,
    stateLibCtx: TFormStateLibCtx<P, V, F, TT, SFT, Ctx>
): TFormControlSubform<P, V, TT, any, Ctx> {
    const template = control.template;
    const actualControls =
        typeof template.controls === 'function'
            ? template.controls(stateLibCtx.state, idx, handle)
            : template.controls;

    return {
        class: 'subform',
        id: '',
        subform: {
            controls: actualControls,
        },
        disabled: control.disabled,
    };
}

function createRenderContent<
    P extends Record<string, unknown>,
    V extends Record<string, unknown>,
    F extends Record<string, unknown>,
    TT extends TFormTemplatePropsType,
    SFT extends TFormSubformPropsType,
    Ctx,
    SubmitType,
>(
    config: TFormConfig<P, V, F, TT, SFT, Ctx, SubmitType>,
    state: TFormState<Ctx>
): TFormControlList<P, V, TT, SFT, Ctx> {
    const controls =
        typeof config.controls === 'function'
            ? config.controls(state)
            : config.controls;
    return controls
        .filter((ctrl) => ctrl !== null)
        .filter(
            (ctrl) =>
                (ctrl.sectionID === undefined ||
                    state.section === undefined ||
                    ctrl.sectionID === state.section) &&
                !ctrl.removed
        );
}

function getControlID<
    P extends Record<string, unknown>,
    V extends Record<string, unknown>,
    TT extends TFormTemplatePropsType,
    SFT extends TFormSubformPropsType,
    Ctx,
>(item: TFormControl<P, V, TT, SFT, keyof P, Ctx>): string | null {
    return item.class !== 'plain' ? item.id : null;
}

function getControlProps<
    P extends Record<string, unknown>,
    V extends Record<string, unknown>,
    TT extends TFormTemplatePropsType,
    SFT extends TFormSubformPropsType,
    Ctx,
>(
    item: TFormControl<P, V, TT, SFT, keyof P, Ctx>
): TFormControlSpecificProps<P, V, TT, SFT, Ctx> | null {
    switch (item.class) {
        case 'plain':
        case 'custom':
            return null;
        case 'subform':
            return item.subform;
        case 'template':
            return item.template;
        default:
            return item.prop as P[keyof P];
    }
}

function getFormControlInheritedProps(state: TFormInternalState<unknown>): TFormControlInheritedStateProps {
    return {
        disabled: state.mode == 'loading',
        readOnly: state.mode != 'ready',
        hidden: false,
        removed: false,
    }
}

function wrap(
    content: React.ReactNode,
    wrapper?: (content: React.ReactNode) => React.ReactNode
) {
    return wrapper ? wrapper(content) : content;
}
