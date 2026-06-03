import { useState } from 'react';
import { createFormHook, TFormControlBaseProps } from '../turbo-react-forms';
import { DemoPage } from './components/DemoPage';

type TTextProps = {
    maxLen: number;
};

const { useForm, newEmptyList } = createFormHook({
    controls: {
        text: {
            onRender: function (bp: TFormControlBaseProps, p: TTextProps) {
                return (
                    <input
                        type="text"
                        maxLength={p.maxLen}
                        value={bp.value}
                    ></input>
                );
            },
        },
        checkBox: {
            onRender: function (
                bp: TFormControlBaseProps,
                props: { aaa: number }
            ) {
                return <input type="checkbox" value={bp.value}></input>;
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
        { id: 'something', type: 'text' as const, prop: { maxLen: 344 } },
    ];
    const [formResponse, setFormResponse] = useState('-');

    const frm = useForm({
        controls: () => items,
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
        const result = await frm.show(null, null);
        setFormResponse(JSON.stringify(result));
        debugger;
    }
}
