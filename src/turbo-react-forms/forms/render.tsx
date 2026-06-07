import {
    TFormControl,
    TFormControlAtomicProps,
    TFormControlBaseProps,
    TFormControlCommonPropsDef,
    TFormControlCustom,
    TFormControlLib,
    TFormControlList,
    TFormControlString,
    TFormControlTyped,
    TFormState,
} from '.';
import { FormUtils, IDataObject } from '..';
import { TFormControlContainer } from './FormControlContainer';

export const RenderUtils = {
    renderContent,
};

function newBaseProps<
    P extends Record<string, unknown>,
    V extends Record<string, unknown>,
    F extends Record<string, unknown>,
    Ctx,
>(
    item: TFormControlString<P, V, keyof P, Ctx>,
    state: TFormState<Ctx>,
    rawData: IDataObject,
    lib: TFormControlLib<P, V, F>
): TFormControlBaseProps {
    return {
        id: item.id,
        disabled: item.disabled ?? state.mode == 'loading',
        readOnly: item.readOnly || state.mode !== 'ready',
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
    Ctx,
>(
    list: TFormControlList<P, V, Ctx>,
    state: TFormState<Ctx>,
    lib: TFormControlLib<P, V, F>,
    rawData: IDataObject
) {
    return (
        <>
            {list.map((item, idx) => {
                const key = item.class !== 'plain' ? item.id : 'plain' + idx;
                return (
                    <TFormControlContainer control={item} key={key}>
                        {renderControl(item, state, lib, rawData)}
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
    Ctx,
>(
    item: TFormControl<P, V, keyof P, Ctx>,
    state: TFormState<Ctx>,
    lib: TFormControlLib<P, V, F>,
    rawData: IDataObject
): React.ReactNode {
    // an invisible / removed control should not be there anyway, but just to allow universal use :-)
    if (item.hidden || item.removed) {
        return <></>;
    }

    switch (item.class) {
        case 'plain':
            return item.onRender(state.ctx);
        case 'custom':
            return renderCustomControl(item, state, lib, rawData);
        case 'dynamic':
            throw 'not implemented';
        case 'subform':
            throw 'not implemented';
        case 'template':
            throw 'not implemented';
        default:
            return renderTypedControl(item, state, lib, rawData);
    }
}

function renderTypedControl<
    P extends Record<string, unknown>,
    V extends Record<string, unknown>,
    F extends Record<string, unknown>,
    Ctx,
>(
    item: TFormControlTyped<P, V, keyof P, Ctx>,
    state: TFormState<Ctx>,
    lib: TFormControlLib<P, V, F>,
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

function renderCustomControl<
    P extends Record<string, unknown>,
    V extends Record<string, unknown>,
    F extends Record<string, unknown>,
    Ctx,
>(
    item: TFormControlCustom<V, Ctx>,
    state: TFormState<Ctx>,
    lib: TFormControlLib<P, V, F>,
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
    return ctrl.onWrap ? ctrl.onWrap(content) : content;
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
