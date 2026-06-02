import { useState } from 'react';
import { createFormHook, TFormControlBaseProps } from '../turbo-react-forms';
import { DemoPage } from './components/DemoPage';

type TTextProps = {
    maxLen: number;
};

const { useForm, emptyList } = createFormHook({
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
});

export function DemoForms() {
    const items: typeof emptyList = [
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
    }
}
