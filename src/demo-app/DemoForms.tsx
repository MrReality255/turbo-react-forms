import { PropsWithChildren, useState } from 'react';
import {
    createFormHook,
    DataUtils,
    TFormControlBaseProps,
    useClosingEffect,
    useFormContext,
} from '../turbo-react-forms';
import { DemoPage } from './components/DemoPage';

type TTextProps = {
    maxLen: number;
};

type TFormProps = {
    title: string;
    isLoading: boolean;
};

function DemoFormWrapper(p: PropsWithChildren<TFormProps>) {
    const ctx = useFormContext();
    const closer = useClosingEffect({ mode: 'resize', delay: 300 });
    ctx.hideMethodRef.current = (prev) => {
        closer.hide(prev);
    };
    return (
        <div
            style={{
                ...closer.get(),
                position: 'absolute',
                background: '#030',
                minWidth: '640px',
                minHeight: '480px',
            }}
        >
            <h1>{p.title}</h1>
            <button onClick={() => ctx.close()}>Close()</button>
            <h2>Raw data</h2>
            <p>{JSON.stringify(ctx.data.getRef())}</p>
            {p.children}
            {p.isLoading && (
                <div
                    style={{
                        position: 'absolute',
                        width: '100%',
                        height: '100%',
                        left: 0,
                        top: 0,
                        bottom: 0,
                        right: 0,
                        background: '#000',
                        opacity: 0.5,
                    }}
                >
                    Loading
                </div>
            )}
        </div>
    );
}

const { useForm, newEmptyList } = createFormHook({
    onRenderMainWrapper: (content: React.ReactNode, form: TFormProps) => {
        return <DemoFormWrapper {...form}>{content}</DemoFormWrapper>;
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
    validators: {
        number: (x: string) => !isNaN(parseFloat(x)),
    },
});

export function DemoForms() {
    const el = newEmptyList();
    const items: typeof el = [
        {
            id: 'tb1',
            type: 'text',
            class: undefined,
            prop: { maxLen: 30 },
        },
        {
            id: 'cb1',
            class: undefined,
            type: 'checkBox',
            prop: {
                aaa: 3,
            },
        },
        {
            id: 'custom1',
            class: 'custom',
            onWrap: (c) => {
                return (
                    <div style={{ background: '#010', padding: '1em' }}>
                        {c}
                    </div>
                );
            },
            onRender: (p) => {
                return (
                    <div>
                        Custom control
                        <input
                            readOnly={p.readOnly}
                            disabled={p.disabled}
                            value={p.value}
                            onChange={(e) =>
                                p.onValueChange(e.currentTarget.value)
                            }
                            type="text"
                            style={{ color: p.valid ? undefined : 'red' }}
                        ></input>
                        {DataUtils.Validity.getHint(p.valid)}
                    </div>
                );
            },
        },
        {
            id: 'list1',
            class: 'template',
            template: {
                minCount: 1,
                controls: () => {
                    return [
                        {
                            id: 'listItemName',
                            type: 'text',
                            prop: { maxLen: 200 },
                        },
                    ];
                },
            },
        },
    ];
    const [formResponse, setFormResponse] = useState('-');

    const frm = useForm<{ id: number }, any>({
        controls: () => items,
        form: (state) => {
            return {
                title: 'My demo form',
                isLoading: state.mode !== 'ready',
            };
        },
        onUpdate: function (cmd, event, ctx, data) {
            switch (event.id) {
                case 'custom1':
                    if (event.type == 'value' && event.value.length > 4) {
                        return new Promise((resolve) => {
                            setTimeout(() => {
                                resolve(undefined);
                            }, 500);
                        });
                    }
                default:
                    console.log('triggered event: ' + JSON.stringify(event));
            }
        },
    });
    return (
        <DemoPage>
            <h1>Demo forms</h1>
            <button onClick={() => handleBtn()}>Show</button>
            <h2>Response</h2>
            {formResponse}
        </DemoPage>
    );

    async function handleBtn() {
        const result = await frm.show(null, { id: 324 });
        setFormResponse(JSON.stringify(result));
    }
}
