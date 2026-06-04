import {
    DataUtils,
    TDataObject,
    TDataObjectMap,
    TFormConfig,
    TFormControl,
    TFormControlList,
    TFormControlString,
    TFormControlSubform,
    TFormControlTemplate,
    TFormStateLibCtx,
    THandleProvider,
} from '..';

export const FormUtils = {
    createInitData,
};

function createInitData<
    P extends Record<string, unknown>,
    V extends Record<string, unknown>,
    F extends Record<string, unknown>,
    Ctx,
    SubmitType,
>(
    initData: TDataObjectMap | null,
    config: TFormConfig<P, V, F, Ctx, SubmitType>,
    stateLibCtx: TFormStateLibCtx<P, V, F, Ctx>
): TDataObjectMap {
    initData = initData ?? {};
    const myControlList =
        typeof config.controls === 'function'
            ? config.controls(stateLibCtx.state)
            : config.controls;

    const result: TDataObjectMap = {};
    createInitDataForControlList<P, V, F, Ctx>(
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
    Ctx,
>(
    result: TDataObjectMap,
    controlList: TFormControl<P, V, keyof P, Ctx>[],
    initData: TDataObjectMap,
    stateLibCtx: TFormStateLibCtx<P, V, F, Ctx>,
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
    Ctx,
>(
    result: TDataObjectMap,
    control: TFormControl<P, V, keyof P, Ctx>,
    initData: TDataObjectMap,
    stateLibCtx: TFormStateLibCtx<P, V, F, Ctx>,
    handleProvider: THandleProvider
) {
    if (control.class == 'plain' || control.removed) {
        return;
    }

    switch (control.class) {
        case 'template':
            createInitDateForTemplate<P, V, F, Ctx>(
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
    Ctx,
>(
    result: TDataObjectMap,
    control: TFormControlTemplate<P, V, Ctx>,
    initData: TDataObjectMap,
    stateLibCtx: TFormStateLibCtx<P, V, F, Ctx>,
    handleProvider: THandleProvider
) {
    const initList = DataUtils.DataObject.getList(
        () => initData[control.id]
    ) ?? {
        type: 'list',
        items: [],
    };

    result[control.id] = {
        type: 'list',
        items: initList.items.map((item, idx) => {
            const newObj: TDataObject = {
                type: 'obj',
                data: {},
                id: handleProvider(),
            };
            const clf = control.template.controls;
            const actualControls =
                typeof clf === 'function'
                    ? clf(stateLibCtx.state, idx, newObj.id)
                    : clf;

            createInitDataForSubform(
                newObj.data,
                {
                    class: 'subform',
                    id: '',
                    subform: {
                        controls: actualControls,
                    },
                    disabled: control.disabled,
                },
                item.data,
                stateLibCtx,
                handleProvider
            );
            return newObj;
        }),
    };
}

function createInitDataForSubform<
    P extends Record<string, unknown>,
    V extends Record<string, unknown>,
    F extends Record<string, unknown>,
    Ctx,
>(
    result: TDataObjectMap,
    control: TFormControlSubform<P, V, Ctx>,
    initData: TDataObjectMap,
    stateLibCtx: TFormStateLibCtx<P, V, F, Ctx>,
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
            : () => control.subform.controls as TFormControlList<P, V, Ctx>;

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
    Ctx,
>(
    result: TDataObjectMap,
    control: TFormControlString<P, V, keyof P, Ctx>,
    initData: TDataObjectMap,
    stateLibCtx: TFormStateLibCtx<P, V, F, Ctx>
) {
    const rawValue = DataUtils.DataObject.getRawValue(
        () => initData[control.id],
        false
    );
    result[control.id] = DataUtils.DataObject.newValue(
        rawValue,
        validate(rawValue, control, stateLibCtx)
    );
}

function validate<
    P extends Record<string, unknown>,
    V extends Record<string, unknown>,
    F extends Record<string, unknown>,
    Ctx,
>(
    value: string,
    control: TFormControlString<P, V, keyof P, Ctx>,
    stateLibCtx: TFormStateLibCtx<P, V, F, Ctx>
): boolean {
    if (!value) {
        return control.optional ?? false;
    }
    if (control.onValidate && !control.onValidate(value, stateLibCtx.ctx)) {
        return false;
    }

    if (control.class === 'dynamic') {
        return true;
    }

    if (control.validation) {
        const validatorFct = stateLibCtx.lib.validators?.[control.validation];
        if (validatorFct && !validatorFct(value)) {
            return false;
        }
    }
    return true;
}
