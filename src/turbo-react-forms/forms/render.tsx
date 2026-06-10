import {
    TFormConfig,
    TFormControl,
    TFormControlAtomicProps,
    TFormControlBaseProps,
    TFormControlCommonPropsDef,
    TFormControlCustom,
    TFormControlDynamic,
    TFormControlLib,
    TFormControlList,
    TFormControlString,
    TFormControlTemplate,
    TFormControlTyped,
    TFormControlWrapperBaseProps,
    TFormState,
    TFormTemplatePropsType,
    TFormTemplateStateProps,
} from '.';
import { DataUtils, FormUtils, IDataObject } from '..';
import { TFormControlContainer } from './FormControlContainer';

export const RenderUtils = {
    renderContent,
};

function newBaseRenderWrapperProps<
    P extends Record<string, unknown>,
    V extends Record<string, unknown>,
    TT extends TFormTemplatePropsType,
    Ctx,
>(
    item: TFormControl<P, V, TT, keyof P, Ctx>,
    state: TFormState<Ctx>,
    rawData: IDataObject
): TFormControlWrapperBaseProps {
    if (item.class === 'plain') {
        return {
            id: '',
            valid: null,
            value: null,
            disabled: state.mode == 'loading',
            readOnly: state.mode !== 'ready',
            optional: false,
        };
    }

    return {
        id: item.id,
        disabled: item.disabled || state.mode == 'loading',
        readOnly: item.readOnly || state.mode !== 'ready',
        value: rawData.getRawValue(item.id),
        valid: rawData.getValidity(item.id),
        optional: item.optional ?? false,
        context: item.context,
        label: item.label,
    };
}

function newBaseProps<
    P extends Record<string, unknown>,
    V extends Record<string, unknown>,
    F extends Record<string, unknown>,
    TT extends TFormTemplatePropsType,
    Ctx,
>(
    item: TFormControlString<P, V, keyof P, Ctx>,
    state: TFormState<Ctx>,
    rawData: IDataObject,
    lib: TFormControlLib<P, V, F, TT>
): TFormControlBaseProps {
    return {
        ...newBaseRenderWrapperProps(item, state, rawData),
        value: rawData.getRawValue(item.id),
        valid: rawData.getValidity(item.id),
        onValueChange: (newValue) => {
            newValue = prepareValue(newValue, item);
            const isValid = FormUtils.validate<P, V, any, Ctx>(newValue, item, {
                ctx: state.ctx,
                lib: lib,
                state: state,
            });
            rawData.setValue(item.id, newValue, isValid);
        },
    };
}

function renderContent<
    P extends Record<string, unknown>,
    V extends Record<string, unknown>,
    F extends Record<string, unknown>,
    TT extends TFormTemplatePropsType,
    Ctx,
>(
    list: TFormControlList<P, V, TT, Ctx>,
    state: TFormState<Ctx>,
    lib: TFormControlLib<P, V, F, TT>,
    config: TFormConfig<P, V, F, TT, Ctx, any>,
    rawData: IDataObject
) {
    return (
        <>
            {list.map((item, idx) => {
                const key = item.class !== 'plain' ? item.id : 'plain' + idx;
                return (
                    <TFormControlContainer control={item} key={key}>
                        {renderControl(item, state, lib, config, rawData)}
                    </TFormControlContainer>
                );
            })}
        </>
    );
}

function renderControl<
    P extends Record<string, unknown>,
    V extends Record<string, unknown>,
    F extends Record<string, unknown>,
    TT extends TFormTemplatePropsType,
    Ctx,
>(
    item: TFormControl<P, V, TT, keyof P, Ctx>,
    state: TFormState<Ctx>,
    lib: TFormControlLib<P, V, F, TT>,
    config: TFormConfig<P, V, F, TT, Ctx, any>,
    rawData: IDataObject
): React.ReactNode {
    // an invisible / removed control should not be there anyway, but just to allow universal use :-)
    if (item.hidden || item.removed) {
        return <></>;
    }
    const content = renderControlContent(item, state, lib, rawData);

    if (lib.onRenderControl) {
        return lib.onRenderControl(
            content,
            {
                ...newBaseRenderWrapperProps(item, state, rawData),
                class: item.class as string | undefined,
                type:
                    item.class === 'dynamic' || item.class === undefined
                        ? (item.type as string)
                        : null,
            },
            (hint) =>
                translateHint(
                    translateHint(
                        hint,
                        DataUtils.orNone(
                            config.onTranslateHint,
                            (trFct) => (hint: string) =>
                                trFct(
                                    hint,
                                    FormUtils.getControlID(item) ?? '',
                                    FormUtils.getControlProps(item)
                                )
                        )
                    ),
                    lib.onTranslateHint
                )
        );
    }
    return content;
}

function renderControlContent<
    P extends Record<string, unknown>,
    V extends Record<string, unknown>,
    F extends Record<string, unknown>,
    TT extends TFormTemplatePropsType,
    Ctx,
>(
    item: TFormControl<P, V, TT, keyof P, Ctx>,
    state: TFormState<Ctx>,
    lib: TFormControlLib<P, V, F, TT>,
    rawData: IDataObject
) {
    switch (item.class) {
        case 'plain':
            return item.onRender(state.ctx);
        case 'custom':
            return renderCustomControl(item, state, lib, rawData);
        case 'dynamic':
            return renderDynamicControl(item, state, lib, rawData);
        case 'subform':
            throw 'not implemented';
        case 'template':
            return renderTemplateControl(item, state, lib, rawData);
        default:
            return renderTypedControl(item, state, lib, rawData);
    }
}

function renderTemplateControl<
    P extends Record<string, unknown>,
    V extends Record<string, unknown>,
    F extends Record<string, unknown>,
    TT extends TFormTemplatePropsType,
    Ctx,
>(
    ctrl: TFormControlTemplate<P, V, TT, Ctx>,
    state: TFormState<Ctx>,
    lib: TFormControlLib<P, V, F, TT>,
    rawData: IDataObject
) {
    const items = rawData.listItems(ctrl.id);
    const disableAdd =
        ctrl.template.maxCount !== undefined &&
        items.length >= ctrl.template.maxCount;
    const disableDelete =
        ctrl.template.minCount !== undefined &&
        items.length <= ctrl.template.minCount;

    const content = renderTemplateControls(ctrl, state, lib, items);
    const templateStateProps: TFormTemplateStateProps = {
        disableAdd,
        disableDelete,

        triggerAdd: () => {
            rawData.listAdd(
                ctrl.id,
                DataUtils.orNone(
                    ctrl.template.onNewItem,
                    (n) => () => n(items.length, state)
                )
            );
        },
    };

    const contentNode = FormUtils.wrap(
        FormUtils.wrap(
            content,
            DataUtils.orNone(
                ctrl.template.onWrapItems,
                (fct) => (content: React.ReactNode) =>
                    fct(content, templateStateProps, state)
            )
        ),
        DataUtils.orNone(
            lib.onRenderTemplateItems,
            (fct) => (content: React.ReactNode) =>
                fct(content, templateStateProps, ctrl.props)
        )
    );

    return wrapControl(ctrl, contentNode);
}

function renderTemplateControls<
    P extends Record<string, unknown>,
    V extends Record<string, unknown>,
    F extends Record<string, unknown>,
    TT extends TFormTemplatePropsType,
    Ctx,
>(
    ctrl: TFormControlTemplate<P, V, TT, Ctx>,
    state: TFormState<Ctx>,
    lib: TFormControlLib<P, V, F, TT>,
    items: IDataObject[]
): React.ReactNode {
    return <div>Item count: {items.length}</div>;
}

function renderTypedControl<
    P extends Record<string, unknown>,
    V extends Record<string, unknown>,
    F extends Record<string, unknown>,
    TT extends TFormTemplatePropsType,
    Ctx,
>(
    item: TFormControlTyped<P, V, keyof P, Ctx>,
    state: TFormState<Ctx>,
    lib: TFormControlLib<P, V, F, TT>,
    rawData: IDataObject
) {
    return wrapControl(
        item,
        lib.controls[item.type].onRender(
            newBaseProps(item, state, rawData, lib),
            item.prop
        )
    );
}

function renderDynamicControl<
    P extends Record<string, unknown>,
    V extends Record<string, unknown>,
    F extends Record<string, unknown>,
    TT extends TFormTemplatePropsType,
    Ctx,
>(
    item: TFormControlDynamic<Ctx>,
    state: TFormState<Ctx>,
    lib: TFormControlLib<P, V, F, TT>,
    rawData: IDataObject
) {
    return renderTypedControl(
        {
            ...item,
            class: undefined,
            prop: item.prop as unknown as P[keyof P],
        },
        state,
        lib,
        rawData
    );
}

function renderCustomControl<
    P extends Record<string, unknown>,
    V extends Record<string, unknown>,
    F extends Record<string, unknown>,
    TT extends TFormTemplatePropsType,
    Ctx,
>(
    item: TFormControlCustom<V, Ctx>,
    state: TFormState<Ctx>,
    lib: TFormControlLib<P, V, F, TT>,
    rawData: IDataObject
) {
    return wrapControl(
        item,
        item.onRender({
            ...newBaseProps(item, state, rawData, lib),
            ctx: state.ctx,
        })
    );
}

function wrapControl(
    ctrl: TFormControlCommonPropsDef,
    content: React.ReactNode
) {
    return FormUtils.wrap(content, ctrl.onWrap);
}

function prepareValue<Ctx>(
    newValue: string,
    control: TFormControlAtomicProps<Ctx>
) {
    if (!control.onWriteValue) {
        return newValue;
    }
    return control.onWriteValue(newValue);
}

function translateHint(
    hint: string | undefined,
    onTranslateHint: ((hint: string) => string) | undefined
): string | undefined {
    if (hint === undefined || onTranslateHint === undefined) {
        return hint;
    }
    return onTranslateHint(hint);
}
