import { useState } from 'react';
import { DataUtils } from '../turbo-react-forms';
import { DemoPage } from './components/DemoPage';
import { DemoFormLib } from './DemoFormLib';

const { useForm, newEmptyList } = DemoFormLib;

export function DemoForms() {
    const el = newEmptyList();
    const items: typeof el = [
        {
            id: 'tb1',
            type: 'text',
            class: undefined,
            prop: { maxLen: 30 },
            label: 'Text box1',
            validation: 'number',
            defaultValue: 'bla',
        },
        {
            id: 'cb1',
            class: undefined,
            type: 'checkBox',
            prop: {
                aaa: 3,
            },
            label: 'check box 1',
            context: {
                after: 'Some text after',
                before: 'Some text before',
                bottom: 'Some text at the final bottom',
                top: 'Some text at the top',
            },
        },
        {
            id: 'custom1',
            class: 'custom',
            onWrap: (c) => {
                return (
                    <div>
                        custom control:
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
            props: {
                addText: 'Add new item',
            },
            template: {
                minCount: 1,
                controls: () => {
                    return [
                        {
                            id: 'listItemName',
                            type: 'text',
                            prop: { maxLen: 200 },
                            defaultValue: 'empty',
                            validation: 'number',
                        },
                    ];
                },
                onNewItem: (idx, state) => {
                    return {
                        listItemName: 'item ' + idx,
                    };
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
