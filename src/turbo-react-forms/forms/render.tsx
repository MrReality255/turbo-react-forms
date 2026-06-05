import {
    TFormControl,
    TFormControlCommonProps,
    TFormControlList,
    TFormState,
} from '.';
import { DataUtils, TDataObjectMap } from '..';

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
    rawData: TDataObjectMap
) {
    return <>{list.map((item) => renderControl(item, state, rawData))}</>;
}

function renderControl<
    P extends Record<string, unknown>,
    V extends Record<string, unknown>,
    Ctx,
>(
    item: TFormControl<P, V, keyof P, Ctx>,
    state: TFormState<Ctx>,
    rawData: TDataObjectMap
): React.ReactNode {
    // an invisible / removed control should not be there anyway, but just to allow universal use :-)
    if (item.hidden || item.removed) {
        return <></>;
    }

    switch (item.class) {
        case 'plain':
            return item.onRender(state.ctx);
        case 'custom':
            return wrapControl(
                item,
                item.onRender({
                    ctx: state.ctx,
                    disabled:
                        (item.disabled ?? false) || state.mode !== 'ready',
                    value: DataUtils.DataObject.getRawValue(
                        () => rawData[item.id],
                        false
                    ),
                    onValueChange: (newValue) => {
                        alert('new value');
                    },
                })
            );
        default:
            throw 'not implemented';
    }
}

function wrapControl(ctrl: TFormControlCommonProps, content: React.ReactNode) {
    return ctrl.onWrap ? ctrl.onWrap(content) : content;
}
