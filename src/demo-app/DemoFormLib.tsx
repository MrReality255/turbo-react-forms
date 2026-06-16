import React from 'react';
import {
    createFormHook,
    DataUtils,
    TFormControlBaseProps,
    TFormTemplatePropsType,
    TFormTemplateStateProps,
} from '../turbo-react-forms';
import { DemoFormWrapper, TDemoFormProps } from './DemoFormWrapper';

type TTextProps = {
    label: string;
    maxLen: number;
};

type TTemplateProps = {
    addText: string;
};

const DemoFormLib = createFormHook({
    onRenderMainWrapper: (content: React.ReactNode, form: TDemoFormProps) => {
        return <DemoFormWrapper {...form}>{content}</DemoFormWrapper>;
    },
    onRenderTemplateItems: (
        items: React.ReactNode,
        props: TFormTemplateStateProps,
        customProps: TTemplateProps
    ) => {
        return (
            <div style={{ backgroundColor: '#033', padding: '1em' }}>
                {items}
                <button onClick={() => props.triggerAdd()}>
                    {customProps.addText}{' '}
                </button>
            </div>
        );
    },
    onRenderTemplateItem: (item, data, props, customProps) => {
        return (
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1em',
                }}
            >
                <div style={{ width: '200px' }}>
                    Content of the item {data.getID()}
                </div>
                <div style={{ flex: 1 }}>{item}</div>
            </div>
        );
    },
    onRenderSubform: (content, data, props) => {
        return <div>{content}</div>;
    },
    onRenderSubformControl: (content, data, idx) => {
        return <React.Fragment key={idx}>{content}</React.Fragment>;
    },
    onRenderControl: (content, controlProps, hintTranslator) => {
        return (
            <React.Fragment>
                {controlProps.context?.top}
                <div
                    style={{
                        width: '100%',
                        backgroundColor: '#600',
                        color: '#ff0',
                        padding: '0em',
                    }}
                >
                    ** CONTROL {controlProps.id} **
                    <div>
                        {controlProps.label} - {controlProps.type}/
                        {controlProps.class}
                    </div>
                </div>
                <div
                    style={{
                        backgroundColor: '#000',
                        paddingTop: '1em',
                        paddingBottom: '1em',
                        paddingLeft: '2em',
                        paddingRight: '2em',
                    }}
                >
                    {controlProps.context?.before}
                    {content}
                    {controlProps.context?.after}
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
                    <div
                        style={{
                            width: '100%',
                            margin: 0,
                            padding: 0,
                            backgroundColor: 'blue',
                        }}
                    >
                        <label>{p.label}</label>
                        <input
                            disabled={bp.disabled}
                            readOnly={bp.readOnly}
                            name={bp.id}
                            max={p.maxLen}
                            style={{ width: '100%', margin: 0, padding: 0 }}
                            type="text"
                            value={bp.value}
                            onChange={(e) =>
                                bp.onValueChange(e.currentTarget.value)
                            }
                        ></input>
                    </div>
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

export type TDemoLibControls = ReturnType<typeof DemoFormLib.newEmptyList>;
export const useForm = DemoFormLib.useForm;
