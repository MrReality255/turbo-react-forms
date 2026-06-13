import {
    DataObjectUtils,
    DataUtils,
    TDataObject,
    TDataObjectMap,
    TFormConfig,
    TFormControl,
    TFormControlList,
    TFormControlSpecificProps,
    TFormControlString,
    TFormControlSubform,
    TFormControlTemplate,
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
    config: TFormConfig<P, V, F, TT, SFT, Ctx, SubmitType>,
    stateLibCtx: TFormStateLibCtx<P, V, F, TT, SFT, Ctx>
): TDataObjectMap {
    initData = initData ?? {};
    const myControlList =
        typeof config.controls === 'function'
            ? config.controls(stateLibCtx.state)
            : config.controls;

    const result: TDataObjectMap = {};
    createInitDataForControlList<P, V, F, TT, SFT, Ctx>(
        result,
        myControlList,
        initData,
        stateLibCtx,
        DataUtils.newHandleProvider()
    );
    return result;
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
    controlList: TFormControl<P, V, TT, SFT, keyof P, Ctx>[],
    initData: TDataObjectMap,
    stateLibCtx: TFormStateLibCtx<P, V, F, TT, SFT, Ctx>,
    handleProvider: THandleProvider
) {
    controlList.forEach((control) => {
        createInitDataForControl(
            result,
            control,
            initData,
            stateLibCtx,
            handleProvider
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
    control: TFormControl<P, V, TT, SFT, keyof P, Ctx>,
    initData: TDataObjectMap,
    stateLibCtx: TFormStateLibCtx<P, V, F, TT, SFT, Ctx>,
    handleProvider: THandleProvider
) {
    if (control.class == 'plain' || control.removed) {
        return;
    }

    switch (control.class) {
        case 'template':
            createInitDateForTemplate<P, V, F, TT, SFT, Ctx>(
                result,
                control,
                initData,
                stateLibCtx,
                handleProvider
            );
            return;
        case 'subform':
            createInitDataForSubform(
                result,
                control,
                initData,
                stateLibCtx,
                handleProvider
            );
            return;
        default:
            createInitDataStringControl(result, control, initData, stateLibCtx);
            return;
    }
}

function createInitDateForTemplate<
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
    handleProvider: THandleProvider
) {
    const template = control.template;
    const initList = DataObjectUtils.getList(() => initData[control.id]) ?? {
        type: 'list',
        items: [],
    };

    const items = initList.items
        .filter(
            (_item, idx) =>
                template.maxCount == undefined || idx < template.maxCount
        )
        .map((item, idx) => {
            const newObj: TDataObject = {
                type: 'obj',
                data: {},
                id: handleProvider(),
            };

            createInitDataForSubform(
                newObj.data,
                newTemplateSubForm(control, idx, newObj.id, stateLibCtx),
                item.data,
                stateLibCtx,
                handleProvider
            );
            return newObj;
        });

    // create new items to reach the minimum
    if (template.minCount && items.length < template.minCount) {
        for (let i = items.length; i < template.minCount; i++) {
            items.push(
                newTemplateItem(control, i, stateLibCtx, handleProvider)
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
    control: TFormControlSubform<P, V, TT, SFT, Ctx>,
    initData: TDataObjectMap,
    stateLibCtx: TFormStateLibCtx<P, V, F, TT, SFT, Ctx>,
    handleProvider: THandleProvider
) {
    if (control.useOwnDataObject) {
        result[control.id] = { type: 'obj', data: {}, id: 0 };
    }
    const srcDataObject =
        (control.useOwnDataObject
            ? (initData[control.id] as TDataObject)?.data
            : initData) ?? {};
    const targetObj = control.useOwnDataObject
        ? (result[control.id] as TDataObject).data
        : result;

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

    const actualList = listFct(stateLibCtx.state);

    createInitDataForControlList(
        targetObj,
        actualList,
        srcDataObject,
        stateLibCtx,
        handleProvider
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
    control: TFormControlString<P, V, keyof P, Ctx>,
    initData: TDataObjectMap,
    stateLibCtx: TFormStateLibCtx<P, V, F, TT, SFT, Ctx>
) {
    const rawValue =
        DataObjectUtils.getRawValue(() => initData[control.id], false) ||
        (control.defaultValue ?? '');

    result[control.id] = DataObjectUtils.newValue(
        rawValue,
        validate(rawValue, control, stateLibCtx)
    );
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
    control: TFormControlString<P, V, keyof P, Ctx>,
    stateLibCtx: TFormStateLibCtx<P, V, F, TT, SFT, Ctx>
): TValidity {
    if (!value) {
        return control.optional ?? false;
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
    handleProvider: THandleProvider
): TDataObject {
    const newObj: TDataObject = {
        type: 'obj',
        id: handleProvider(),
        data: {},
    };

    createInitDataForSubform(
        newObj.data,
        newTemplateSubForm(control, idx, newObj.id, stateLibCtx),
        {},
        stateLibCtx,
        handleProvider
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
): TFormControlSubform<P, V, TT, SFT, Ctx> {
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
    return controls.filter(
        (ctrl) =>
            (ctrl.sectionID === undefined ||
                state.section === undefined ||
                ctrl.sectionID === state.section) &&
            !ctrl.removed &&
            !ctrl.hidden
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

function wrap(
    content: React.ReactNode,
    wrapper?: (content: React.ReactNode) => React.ReactNode
) {
    return wrapper ? wrapper(content) : content;
}
