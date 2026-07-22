import React from 'react';
import {
    TFormConfig,
    TFormControl,
    TFormControlAtomicProps,
    TFormControlBaseProps,
    TFormControlCommonPropsDef,
    TFormControlCustom,
    TFormControlDynamic,
    TFormControlInheritedStateProps,
    TFormControlLib,
    TFormControlList,
    TFormControlAtomic,
    TFormControlSubform,
    TFormControlTemplate,
    TFormControlTyped,
    TFormControlWrapperProps,
    TFormState,
    TFormSubformPropsType,
    TFormTemplatePropsType,
    TFormTemplateStateProps,
} from '.';
import { DataUtils, FormUtils, IDataObject } from '..';
import { TFormControlContainer } from './FormControlContainer';

export const RenderUtils = {
    renderContent,
};

const keys = {
    isNew: '__TRF__IsNew',
};

function newBaseRenderWrapperProps<
    P extends Record<string, unknown>,
    V extends Record<string, unknown>,
    TT extends TFormTemplatePropsType,
    SFT extends TFormSubformPropsType,
    Ctx,
>(
    item: TFormControl<P, V, TT, SFT, keyof P, Ctx>,
    rawData: IDataObject,
    inheritedProps: TFormControlInheritedStateProps
): TFormControlWrapperProps {
    if (item.class === 'plain') {
        return {
            id: '',
            valid: null,
            value: null,
            disabled: inheritedProps.disabled,
            readOnly: inheritedProps.readOnly,
            optional: false,
            type: null,
            class: undefined,
        };
    }

    return {
        id: item.id,
        disabled: item.disabled || inheritedProps.disabled,
        readOnly: item.readOnly || inheritedProps.readOnly,
        value: rawData.getRawValue(item.id),
        valid: rawData.getValidity(item.id),
        optional: item.optional ?? false,
        context: item.context,
        label: item.label,
        type: null,
        class: undefined,
    };
}

function newBaseProps<
    P extends Record<string, unknown>,
    V extends Record<string, unknown>,
    F extends Record<string, unknown>,
    TT extends TFormTemplatePropsType,
    SFT extends TFormSubformPropsType,
    Ctx,
    G extends object = object,
>(
    item: TFormControlAtomic<P, V, keyof P, Ctx>,
    state: TFormState<Ctx>,
    rawData: IDataObject,
    lib: TFormControlLib<P, V, F, TT, SFT, G>,
    inheritedProps: TFormControlInheritedStateProps
): TFormControlBaseProps {
    return {
        ...newBaseRenderWrapperProps(item, rawData, inheritedProps),
        value: rawData.getRawValue(item.id),
        valid: rawData.getValidity(item.id),
        onValueChange: (newValue) => {
            newValue = prepareValue(newValue, item);
            const isValid = FormUtils.validate<P, V, F, TT, SFT, Ctx, G>(
                newValue,
                item,
                {
                    ctx: state.ctx,
                    lib: lib,
                    state: state,
                },
                FormUtils.getFormControlInheritedProps(state)
            );
            rawData.setValue(item.id, newValue, isValid);
        },
    };
}

function renderContent<
    P extends Record<string, unknown>,
    V extends Record<string, unknown>,
    F extends Record<string, unknown>,
    TT extends TFormTemplatePropsType,
    SFT extends TFormSubformPropsType,
    Ctx,
    G extends object = object,
>(
    list: TFormControlList<P, V, TT, SFT, Ctx>,
    state: TFormState<Ctx>,
    lib: TFormControlLib<P, V, F, TT, SFT, G>,
    config: TFormConfig<P, V, F, TT, SFT, Ctx, any>,
    rawData: IDataObject,
    inheritedProps: TFormControlInheritedStateProps
) {
    return (
        <>
            {list
                .filter((item) => item !== null)
                .map((item, idx) => {
                    const key = item.class !== 'plain' ? item.id : 'plain' + idx;
                    return (
                        <TFormControlContainer control={item} key={key}>
                            {renderControl(item, state, lib, config, rawData, inheritedProps)}
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
    SFT extends TFormSubformPropsType,
    Ctx,
    G extends object = object,
>(
    item: TFormControl<P, V, TT, SFT, keyof P, Ctx>,
    state: TFormState<Ctx>,
    lib: TFormControlLib<P, V, F, TT, SFT, G>,
    config: TFormConfig<P, V, F, TT, SFT, Ctx, any>,
    rawData: IDataObject,
    inheritedProps: TFormControlInheritedStateProps
): React.ReactNode {
    // an invisible / removed control should not be there anyway, but just to allow universal use :-)
    if (item.removed) {
        return null;
    }
    const content = renderControlContent(item, state, lib, rawData, inheritedProps);

    if (lib.onRenderControl) {
        return lib.onRenderControl(
            content,
            !item.hidden,
            {
                ...newBaseRenderWrapperProps(item, rawData, inheritedProps),
                class: item.class as string | undefined,
                type: item.class === 'dynamic' || item.class === undefined ? (item.type as string) : null,
            },
            (hint) =>
                translateHint(
                    translateHint(
                        hint,
                        DataUtils.orNone(
                            config.onTranslateHint,
                            (trFct) => (hint: string) =>
                                trFct(hint, FormUtils.getControlID(item) ?? '', FormUtils.getControlProps(item))
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
    SFT extends TFormSubformPropsType,
    Ctx,
    G extends object = object,
>(
    item: TFormControl<P, V, TT, SFT, keyof P, Ctx>,
    state: TFormState<Ctx>,
    lib: TFormControlLib<P, V, F, TT, SFT, G>,
    rawData: IDataObject,
    inheritedProps: TFormControlInheritedStateProps
) {
    switch (item.class) {
        case 'plain':
            return item.onRender(state.ctx);
        case 'custom':
            return renderCustomControl(item, state, lib, rawData, inheritedProps);
        case 'dynamic':
            return renderDynamicControl(item, state, lib, rawData, inheritedProps);
        case 'subform':
            return renderSubformControl(item, state, lib, rawData, inheritedProps);
        case 'template':
            return renderTemplateControl(item, state, lib, rawData, inheritedProps);
        default:
            return renderTypedControl(item, state, lib, rawData, inheritedProps);
    }
}

function renderSubformControl<
    P extends Record<string, unknown>,
    V extends Record<string, unknown>,
    F extends Record<string, unknown>,
    TT extends TFormTemplatePropsType,
    SFT extends TFormSubformPropsType,
    Ctx,
    G extends object = object,
>(
    ctrl: TFormControlSubform<P, V, TT, SFT, Ctx>,
    state: TFormState<Ctx>,
    lib: TFormControlLib<P, V, F, TT, SFT, G>,
    rawData: IDataObject,
    inheritedProps: TFormControlInheritedStateProps
): React.ReactNode {
    const data = ctrl.useOwnDataObject ? rawData.objectGet(ctrl.id) : rawData;
    const controls =
        typeof ctrl.subform.controls === 'function' ? ctrl.subform.controls(state, rawData) : ctrl.subform.controls;
    const content = controls
        .filter((item) => item !== null)
        .map((child, idx) => {
            const controlContent = renderControlContent(child, state, lib, data, {
                disabled: ctrl.disabled || inheritedProps.disabled,
                readOnly: ctrl.readOnly || inheritedProps.readOnly,
                hidden: ctrl.hidden || inheritedProps.hidden,
                removed: ctrl.removed || inheritedProps.removed,
            });
            const renderedContent = lib.onRenderSubformControl(controlContent, data, idx);
            const wrappedContent = ctrl.subform.onWrapControl
                ? ctrl.subform.onWrapControl(renderedContent, rawData)
                : renderedContent;
            return <React.Fragment key={idx}>{wrappedContent}</React.Fragment>;
        });

    const wrappedContent = ctrl.subform.onWrapControls ? ctrl.subform.onWrapControls(content, rawData) : content;

    return wrapControl(ctrl, lib.onRenderSubform(wrappedContent, data, ctrl.subform));
}

function renderTemplateControl<
    P extends Record<string, unknown>,
    V extends Record<string, unknown>,
    F extends Record<string, unknown>,
    TT extends TFormTemplatePropsType,
    SFT extends TFormSubformPropsType,
    Ctx,
    G extends object = object,
>(
    ctrl: TFormControlTemplate<P, V, TT, SFT, Ctx>,
    state: TFormState<Ctx>,
    lib: TFormControlLib<P, V, F, TT, SFT, G>,
    rawData: IDataObject,
    inheriedProps: TFormControlInheritedStateProps
) {
    const items = rawData.listItems(ctrl.id);
    const disableAdd = ctrl.template.maxCount !== undefined && items.length >= ctrl.template.maxCount;
    const disableDelete = ctrl.template.minCount !== undefined && items.length <= ctrl.template.minCount;

    const templateStateProps: TFormTemplateStateProps = {
        disableAdd,
        disableDelete,
        count: items.length,

        triggerAdd: () => {
            rawData.listAdd(
                ctrl.id,
                DataUtils.orNone(ctrl.template.onNewItem, (n) => () => n(items.length, state)),
                {
                    [keys.isNew]: true,
                }
            );
        },
        triggerDelete: (idx: number) => {
            rawData.listRemove(ctrl.id, idx);
        },
    };

    const content = FormUtils.wrap(
        FormUtils.wrap(
            renderTemplateRows(ctrl, state, lib, items, templateStateProps, inheriedProps),
            DataUtils.orNone(
                ctrl.template.onWrapTemplate,
                (fct) => (c: React.ReactNode) => fct(c, templateStateProps, state)
            )
        ),
        (c: React.ReactNode) => lib.onRenderTemplate(c, templateStateProps, ctrl.template)
    );

    return wrapControl(ctrl, content);
}

function renderTemplateRows<
    P extends Record<string, unknown>,
    V extends Record<string, unknown>,
    F extends Record<string, unknown>,
    TT extends TFormTemplatePropsType,
    SFT extends TFormSubformPropsType,
    Ctx,
    G extends object = object,
>(
    ctrl: TFormControlTemplate<P, V, TT, SFT, Ctx>,
    state: TFormState<Ctx>,
    lib: TFormControlLib<P, V, F, TT, SFT, G>,
    items: IDataObject[],
    props: TFormTemplateStateProps,
    inheritedProps: TFormControlInheritedStateProps
): React.ReactNode[] {
    return items.map((item, idx) => {
        const controlDef =
            typeof ctrl.template.controls === 'function'
                ? ctrl.template.controls(state, idx, item.getID())
                : ctrl.template.controls;
        const rowControls = controlDef
            .filter((def) => def !== null)
            .map((def) => renderTemplateRowControl(def, item, ctrl, state, lib, props, inheritedProps, idx));
        return FormUtils.wrap(
            FormUtils.wrap(
                rowControls,
                DataUtils.orNone(ctrl.template.onWrapRow, (fct) => (c: React.ReactNode) => fct(c, props, state, idx))
            ),
            (c) => lib.onRenderTemplateRow(c, idx, item.getID(), props, ctrl.template, item.getMetaBool(keys.isNew))
        );
    });
}

function renderTemplateRowControl<
    P extends Record<string, unknown>,
    V extends Record<string, unknown>,
    F extends Record<string, unknown>,
    TT extends TFormTemplatePropsType,
    SFT extends TFormSubformPropsType,
    Ctx,
    G extends object = object,
>(
    def: TFormControl<P, V, TT, SFT, keyof P, Ctx>,
    item: IDataObject,
    ctrl: TFormControlTemplate<P, V, TT, SFT, Ctx>,
    state: TFormState<Ctx>,
    lib: TFormControlLib<P, V, F, TT, SFT, G>,
    props: TFormTemplateStateProps,
    inheritedProps: TFormControlInheritedStateProps,
    rowIdx: number
) {
    const c = renderControlContent(def, state, lib, item, inheritedProps);
    return FormUtils.wrap(
        FormUtils.wrap(
            c,
            DataUtils.orNone(
                ctrl.template.onWrapRowControl,
                (fct) => (content: React.ReactNode) => fct(content, state, rowIdx)
            )
        ),
        (c) => lib.onRenderTemplateRowControl(c, rowIdx, props, ctrl.template)
    );
}

function renderTypedControl<
    P extends Record<string, unknown>,
    V extends Record<string, unknown>,
    F extends Record<string, unknown>,
    TT extends TFormTemplatePropsType,
    SFT extends TFormSubformPropsType,
    Ctx,
    G extends object = object,
>(
    item: TFormControlTyped<P, V, keyof P, Ctx>,
    state: TFormState<Ctx>,
    lib: TFormControlLib<P, V, F, TT, SFT, G>,
    rawData: IDataObject,
    inheritedProps: TFormControlInheritedStateProps
) {
    return wrapControl(
        item,
        lib.controls[item.type].onRender(
            newBaseProps(item, state, rawData, lib, inheritedProps),
            item.prop as P[keyof P] & G
        )
    );
}

function renderDynamicControl<
    P extends Record<string, unknown>,
    V extends Record<string, unknown>,
    F extends Record<string, unknown>,
    TT extends TFormTemplatePropsType,
    SFT extends TFormSubformPropsType,
    Ctx,
    G extends object = object,
>(
    item: TFormControlDynamic<Ctx>,
    state: TFormState<Ctx>,
    lib: TFormControlLib<P, V, F, TT, SFT, G>,
    rawData: IDataObject,
    inheritedProps: TFormControlInheritedStateProps
) {
    return renderTypedControl(
        {
            ...item,
            class: undefined,
            prop: item.prop as unknown as P[keyof P],
        },
        state,
        lib,
        rawData,
        inheritedProps
    );
}

function renderCustomControl<
    P extends Record<string, unknown>,
    V extends Record<string, unknown>,
    F extends Record<string, unknown>,
    TT extends TFormTemplatePropsType,
    SFT extends TFormSubformPropsType,
    Ctx,
    G extends object = object,
>(
    item: TFormControlCustom<V, Ctx>,
    state: TFormState<Ctx>,
    lib: TFormControlLib<P, V, F, TT, SFT, G>,
    rawData: IDataObject,
    inheritedProps: TFormControlInheritedStateProps
) {
    return wrapControl(
        item,
        item.onRender({
            ...newBaseProps(item, state, rawData, lib, inheritedProps),
            ctx: state.ctx,
        })
    );
}

function wrapControl(ctrl: TFormControlCommonPropsDef, content: React.ReactNode) {
    return FormUtils.wrap(content, ctrl.onWrap);
}

function prepareValue<Ctx>(newValue: string, control: TFormControlAtomicProps<Ctx>) {
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
