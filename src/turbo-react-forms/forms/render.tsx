import {
    TFormControl,
    TFormControlAtomicProps,
    TFormControlCommonProps,
    TFormControlCustom,
    TFormControlLib,
    TFormControlList,
    TFormState,
} from '.';
import { FormUtils, IDataObject } from '..';
import { TFormControlContainer } from './FormControlContainer';

export const RenderUtils = {
    renderContent,
};

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
        default:
            throw 'not implemented';
    }
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
            ctx: state.ctx,
            disabled: item.disabled ?? false,
            readOnly: item.readOnly || state.mode !== 'ready',
            hint: rawData.getHint(item.id),
            valid: rawData.isValid(item.id),
            value: rawData.getRawValue(item.id),
            onValueChange: (newValue) => {
                newValue = prepareValue(newValue, item);
                const isValid = FormUtils.validate<P, V, any, Ctx>(
                    newValue,
                    item,
                    {
                        ctx: state.ctx,
                        lib: lib,
                        state: state,
                    }
                );
                rawData.setValue(item.id, newValue, isValid);
            },
        })
    );
}

function wrapControl(ctrl: TFormControlCommonProps, content: React.ReactNode) {
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
