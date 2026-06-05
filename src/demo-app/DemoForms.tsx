import { PropsWithChildren, useState } from 'react';
import {
    createFormHook,
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
            <pre>{JSON.stringify(ctx.stateHandle.state.rawData, null, 2)}</pre>
            {p.children}
        </div>
    );
}

const { useForm, newEmptyList } = createFormHook({
    onRenderMainWrapper: (content: React.ReactNode, form: TFormProps) => {
        return <DemoFormWrapper {...form}></DemoFormWrapper>;
    },
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
        form: {
            title: 'My demo form',
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
        const result = await frm.show(null, null);
        setFormResponse(JSON.stringify(result));
    }
}
