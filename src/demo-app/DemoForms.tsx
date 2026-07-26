import { useState } from 'react';
import { TFormCommandCtx, TFormState, useFormContext } from '../turbo-react-forms';
import { DemoPage } from './components/DemoPage';
import { TDemoLibControls, useForm } from './DemoFormLib';

function getControls(state: TFormState<any>, cmdCtx: TFormCommandCtx): TDemoLibControls {
    const isActivated = state.data.getValue('activator') == 'true';

    return [
        state.data.isValid()
            ? {
                  class: 'plain',
                  onRender: () => <div>Alles valide</div>,
              }
            : null,
        {
            renderProps: {
                column: '1 / 3',
            },
            id: 'list1',
            class: 'template',
            template: {
                minCount: 2,
                addText: 'add item',
                controls: [
                    {
                        id: 'name',
                        class: undefined,
                        type: 'text',
                        prop: { maxLen: 20, label: 'my label' },
                    },
                    {
                        id: 'value',
                        class: undefined,
                        type: 'text',
                        prop: { maxLen: 20, label: 'the value' },
                    },
                ],
                onWrapRowControl: (item) => {
                    return <div>{item}</div>;
                },
                onWrapRow: (item) => {
                    return <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '15px' }}>{item}</div>;
                },
            },
        },
        {
            id: 'textRow',
            class: undefined,
            type: 'text',
            prop: { label: 'text Row', maxLen: 40 },
        },
        {
            id: 'textRow2',
            class: undefined,
            type: 'text',
            prop: { label: 'text Row #2', maxLen: 40 },
        },
        {
            id: 'activator',
            class: undefined,
            type: 'checkBox',
            prop: { aaa: 3 },
            context: {
                top: (
                    <div>
                        This is a top context with buttons:
                        <button
                            onClick={() => {
                                cmdCtx.command({ id: 'cmd1', data: 123 });
                            }}
                        >
                            command
                        </button>
                        <button
                            onClick={() => {
                                cmdCtx.submit();
                            }}
                        >
                            submit
                        </button>
                        <button
                            onClick={() => {
                                cmdCtx.cancel();
                            }}
                        >
                            cancel
                        </button>
                    </div>
                ),
            },
        },
        {
            id: 't1',
            class: undefined,
            type: 'text',
            prop: { label: 'text 1', maxLen: 20 },
            hidden: !isActivated,
        },
        {
            class: 'plain',
            onRender: (ctx) => {
                return <DemoPlain />;
            },
        },
        {
            id: 'subform1',
            class: 'subform',
            useOwnDataObject: true,
            disabled: !isActivated,
            subform: {
                controls: () => {
                    return [
                        {
                            id: 'subtext1',
                            type: 'text',
                            prop: { label: 'Option 1', maxLen: 40 },
                        },
                        {
                            id: 'subtext2',
                            type: 'text',
                            prop: { label: 'Option 2', maxLen: 40 },
                        },
                        {
                            id: 'subtext3',
                            type: 'text',
                            prop: { label: 'Option 3', maxLen: 40 },
                        },
                    ];
                },
                onWrapControl: (c) => {
                    return (
                        <div
                            style={{
                                width: '100%',
                                backgroundColor: 'blue',
                                display: 'flex',
                            }}
                        >
                            <div style={{ flex: 1, padding: '1em' }}>{c}</div>
                        </div>
                    );
                },
                onWrapControls: (c) => {
                    return (
                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr 1fr',
                                gap: '1em',
                            }}
                        >
                            {c}
                        </div>
                    );
                },
            },
        },
    ];
}

export function DemoForms() {
    const [formResponse, setFormResponse] = useState('-');

    const frm = useForm<{ id: number }, any>({
        controls: (state, triggerCmd) => {
            return getControls(state, triggerCmd);
        },
        form: (state) => {
            return {
                title: 'My demo form',
                isLoading: state.mode !== 'ready',
                columns: '1fr 1fr',
            };
        },
        onUpdate: function (cmd, event, ctx, data) {
            if (cmd) {
                switch (cmd?.id) {
                    case 'cmdExt':
                        return {
                            onUpdateData: (_prev, replacerFct) => {
                                return replacerFct((d) => {
                                    d.setValue('activator', 'true', true);
                                });
                            },
                        };
                    case 'cmd1':
                        return new Promise((resolve) => {
                            setTimeout(() => {
                                resolve({
                                    onUpdateData: (prev, replacer) => {
                                        return replacer((d) => {
                                            d.setValue('textRow', 'some value', true);
                                            d.setValue('textRow2', 'some other value', true);
                                        });
                                    },
                                });
                            }, 1000);
                        });
                }
                return {};
            }
            switch (event?.id) {
                case 't1':
                    if (event.type == 'value' && event.value == 'cancel') {
                        return {
                            modalResult: {
                                close: true,
                                cancel: true,
                                id: event.id,
                                submitData: 999,
                            },
                        };
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
        const result = await frm.show(null, { id: 324 }, async (ctx) => {
            return {
                id: 'bla',
                close: true,
                submitData: 777,
            };
        });
        setFormResponse(
            JSON.stringify({
                result,
                raw: result?.rawData?.getRef(),
            })
        );
    }
}

function DemoPlain() {
    const c = useFormContext();
    return (
        <div>
            DemoContext <button onClick={() => c.triggerCommand('cmdExt')}>Test button</button>
        </div>
    );
}
