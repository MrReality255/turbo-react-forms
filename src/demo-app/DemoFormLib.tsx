import React from 'react';
import {
    createFormHook,
    DataUtils,
    TFormControlBaseProps,
    TFormTemplatePropsType,
    TFormTemplateStateProps,
} from '../turbo-react-forms';
import { DemoFormWrapper, TDemoFormProps } from './DemoFormWrapper';
import { DemoCollapse } from './components/DemoCollapse';
import { DemoTemplateRow } from './DemoTemplateRow';
import { DemoControl } from './DemoControl';

type TTextProps = {
    label: string;
    maxLen: number;
};

type TTemplateProps = {
    addText: string;
};

const DemoFormLib = createFormHook({
    onRenderMainWrapper: (content: React.ReactNode, form: TDemoFormProps) => {
        return (
            <DemoFormWrapper isLoading={form.isLoading} title={form.title}>
                {content}
            </DemoFormWrapper>
        );
    },
    onRenderTemplate: (content: React.ReactNode, stateProps: TFormTemplateStateProps, props: TTemplateProps) => {
        return (
            <div style={{ backgroundColor: '#033', padding: '1em' }}>
                {content}
                <button onClick={() => stateProps.triggerAdd()}>{props.addText}</button>
            </div>
        );
    },
    onRenderTemplateRowControl: (content, rowIdx, stateProps) => content,
    onRenderTemplateRow: (content, idx, handle, stateProps, _, isNew) => (
        <DemoTemplateRow
            key={handle}
            idx={idx}
            handle={handle}
            content={content}
            stateProps={stateProps}
            isNew={isNew}
        />
    ),

    onRenderSubform: (content, data, props) => {
        return <div>{content}</div>;
    },
    onRenderSubformControl: (content, data, idx) => {
        return <React.Fragment key={idx}>{content}</React.Fragment>;
    },
    onRenderControl: (content, visible, controlProps, hintTranslator) => (
        <DemoControl visible={visible} hintTranslator={hintTranslator} controlProps={controlProps}>
            {content}
        </DemoControl>
    ),
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
                            onChange={(e) => bp.onValueChange(e.currentTarget.value)}
                        ></input>
                    </div>
                );
            },
        },
        checkBox: {
            forcedDefaultValue: 'false',
            onRender: function (bp: TFormControlBaseProps, props: { aaa: number }) {
                return (
                    <input
                        type="checkbox"
                        checked={bp.value != 'false' && bp.value != ''}
                        onChange={(e) => bp.onValueChange(e.currentTarget.checked ? 'true' : 'false')}
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
