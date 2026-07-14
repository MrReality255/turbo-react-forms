import { useState } from 'react';
import { DataObjectUtils, DataUtils, TFormState } from '../turbo-react-forms';
import { DemoPage } from './components/DemoPage';
import { TDemoLibControls, useForm } from './DemoFormLib';

function getControls(state: TFormState<any>): TDemoLibControls {
    const isActivated = state.data.getValue('activator') == 'true';

    return [
        /*
        state.data.isValid() ? {
            class: 'plain',
            onRender: () => <div>Alles valide</div>,
        } : null,
         */
        /*
        {
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
        },*/
        {
            id: 't1',
            class: undefined,
            type: 'text',
            prop: { label: 'text 1', maxLen: 20 },
            // hidden: !isActivated,
        },
        {
            id: 'activator',
            class: undefined,
            type: 'checkBox',
            prop: { aaa: 3 },
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
        controls: (state) => {
            return getControls(state);
        },
        form: (state) => {
            return {
                title: 'My demo form',
                isLoading: state.mode !== 'ready',
            };
        },
        onUpdate: function (cmd, event, ctx, data) {
            switch (event.id) {
                case 't1':
                    /*
                    if (event.type == 'value' && event.value.length > 4) {
                        return new Promise((resolve) => {
                            setTimeout(() => {
                                resolve(undefined);
                            }, 500);
                        });
                    }
                        */

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
