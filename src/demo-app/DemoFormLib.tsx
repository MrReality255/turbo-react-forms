import React from 'react';
import {
    createFormHook,
    DataUtils,
    TFormControlBaseProps,
} from '../turbo-react-forms';
import { DemoFormWrapper, TDemoFormProps } from './DemoFormWrapper';

type TTextProps = {
    maxLen: number;
};

export const DemoFormLib = createFormHook({
    onRenderMainWrapper: (content: React.ReactNode, form: TDemoFormProps) => {
        return <DemoFormWrapper {...form}>{content}</DemoFormWrapper>;
    },
    onRenderTemplateItems: (items, props) => {
        return items;
    },
    onRenderControl: (content, controlProps, hintTranslator) => {
        return (
            <React.Fragment>
                {controlProps.context?.top}
                <div
                    style={{
                        backgroundColor: '#000',
                        paddingTop: '1em',
                        paddingBottom: '1em',
                        paddingLeft: '2em',
                    }}
                >
                    {controlProps.context?.before}
                    <div>
                        {controlProps.label} - {controlProps.type}/
                        {controlProps.class}
                    </div>
                    {content}
                    {controlProps.context?.after}
                    {JSON.stringify(controlProps.valid)}
                    {controlProps.valid ? (
                        <div style={{ color: 'red' }}>
                            {hintTranslator(
                                DataUtils.Validity.getHint(controlProps.valid)
                            )}
                        </div>
                    ) : null}
                </div>
                {controlProps.context?.bottom}
            </React.Fragment>
        );
    },
    controls: {
        text: {
            onRender: function (bp: TFormControlBaseProps, p: TTextProps) {
                return (
                    <input
                        type="text"
                        max={p.maxLen}
                        value={bp.value}
                        onChange={(e) =>
                            bp.onValueChange(e.currentTarget.value)
                        }
                    ></input>
                );
            },
        },
        checkBox: {
            onRender: function (
                bp: TFormControlBaseProps,
                props: { aaa: number }
            ) {
                return (
                    <input
                        type="checkbox"
                        checked={bp.value != 'false' && bp.value != ''}
                        onChange={(e) =>
                            bp.onValueChange(
                                e.currentTarget.checked ? 'true' : 'false'
                            )
                        }
                    ></input>
                );
            },
        },
    },
    templateTypes: {},
    validators: {
        number: (x: string, props: unknown) =>
            isNaN(parseFloat(x))
                ? {
                      hint: 'not_a_number_' + JSON.stringify(props),
                      valid: false,
                  }
                : true,
        too_long: (x: string, props: unknown | null) => {
            return props !== null && x.length > (props as TTextProps).maxLen
                ? { valid: false, hint: 'too_long' }
                : true;
        },
    },
});
