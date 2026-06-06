import {
    TFormControl,
    TFormControlCommonProps,
    TFormControlCustom,
    TFormControlList,
    TFormState,
} from '.';
import { IDataObject } from '..';
import { TFormControlContainer } from './FormControlContainer';

export const RenderUtils = {
    renderContent,
};

function renderContent<
    P extends Record<string, unknown>,
    V extends Record<string, unknown>,
    Ctx,
>(
    list: TFormControlList<P, V, Ctx>,
    state: TFormState<Ctx>,
    rawData: IDataObject
) {
    return (
        <>
            {list.map((item, idx) => {
                const key = item.class !== 'plain' ? item.id : 'plain' + idx;
                return (
                    <TFormControlContainer control={item} key={key}>
                        {renderControl(item, state, rawData)}
                    </TFormControlContainer>
                );
            })}
        </>
    );
}

function renderControl<
    P extends Record<string, unknown>,
    V extends Record<string, unknown>,
    Ctx,
>(
    item: TFormControl<P, V, keyof P, Ctx>,
    state: TFormState<Ctx>,
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
            return renderCustomControl(item, state, rawData);
        default:
            throw 'not implemented';
    }
}

function renderCustomControl<V extends Record<string, unknown>, Ctx>(
    item: TFormControlCustom<V, Ctx>,
    state: TFormState<Ctx>,
    rawData: IDataObject
) {
    return wrapControl(
        item,
        item.onRender({
            ctx: state.ctx,
            disabled: (item.disabled ?? false) || state.mode !== 'ready',
            hint: rawData.getHint(item.id),
            valid: rawData.isValid(item.id),
            value: rawData.getRawValue(item.id),
            onValueChange: (newValue) => {
                alert('new value' + newValue);
            },
        })
    );
}

function wrapControl(ctrl: TFormControlCommonProps, content: React.ReactNode) {
    return ctrl.onWrap ? ctrl.onWrap(content) : content;
}
