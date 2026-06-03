import {
    DataUtils,
    TDataObjectMap,
    TFormConfig,
    TFormControlLib,
    TFormControlSubform,
    TFormControlTemplate,
    TFormControlTyped,
    TFormState,
} from '..';

export const FormUtils = {
    createInitData,
};

function createInitData<
    P extends Record<string, unknown>,
    V extends Record<string, unknown>,
    Ctx,
    SubmitType,
>(
    initData: TDataObjectMap | null,
    initState: TFormState<Ctx>,
    ctx: Ctx,
    config: TFormConfig<P, V, Ctx, SubmitType>,
    lib: TFormControlLib<P, V>
): TDataObjectMap {
    initData = initData ?? {};
    const myControlList =
        typeof config.controls === 'function'
            ? config.controls(initState)
            : config.controls;

    const result: TDataObjectMap = {};
    myControlList.forEach((control) => {
        switch (control.class) {
            case 'template':
                createInitDateForTemplate(result, control, initData, ctx, lib);
                return;
            case 'subform':
                createInitDateForSubform(result, control, initData, ctx, lib);
                return;
            default:
                createInitDataTypedControl(result, control, initData, ctx, lib);
                return;
        }
    });
    return result;
}

function createInitDateForTemplate<
    P extends Record<string, unknown>,
    V extends Record<string, unknown>,
    Ctx,
>(
    result: TDataObjectMap,
    control: TFormControlTemplate<P, V, Ctx>,
    initData: TDataObjectMap,
    ctx: Ctx,
    lib: TFormControlLib<P, V>
) {
    const list = DataUtils.DataObject.getList(() => initData[control.id]) ?? {
        type: 'list',
        items: [],
    };
}

function createInitDateForSubform<
    P extends Record<string, unknown>,
    V extends Record<string, unknown>,
    Ctx,
>(
    result: TDataObjectMap,
    control: TFormControlSubform<P, V, Ctx>,
    initData: TDataObjectMap,
    ctx: Ctx,
    lib: TFormControlLib<P, V>
) {
    throw new Error('Function not implemented.');
}

function createInitDataTypedControl<
    P extends Record<string, unknown>,
    V extends Record<string, unknown>,
    Ctx,
>(
    result: TDataObjectMap,
    control: TFormControlTyped<P, V, keyof P, Ctx>,
    initData: TDataObjectMap,
    ctx: Ctx,
    lib: TFormControlLib<P, V>
) {
    const rawValue = DataUtils.DataObject.getRawValue(
        () => initData[control.id],
        false
    );
    result[control.id] = DataUtils.DataObject.newValue(
        rawValue,
        validate(rawValue, ctx, control, lib)
    );
}

function validate<
    P extends Record<string, unknown>,
    V extends Record<string, unknown>,
    Ctx,
>(
    value: string,
    ctx: Ctx,
    control: TFormControlTyped<P, V, keyof P, Ctx>,
    lib: TFormControlLib<P, V>
): boolean {
    if (!value) {
        return control.optional ?? false;
    }

    if (!control.onValidate && !control.validation) {
        return true;
    }

    if (control.onValidate && !control.onValidate(value, ctx)) {
        return false;
    }

    if (control.validation) {
        const validatorFct = lib.validators?.[control.validation];
        if (validatorFct && !validatorFct(value)) {
            return false;
        }
    }
    return true;
}
