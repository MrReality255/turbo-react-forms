import { useState } from 'react';
import { DemoPage } from './components/DemoPage';
import { InlineForm } from './DemoFormLib';

type InlineFormCtx = {
    id: number;
};

export function DemoInlineForms() {
    const [mainFormData, setMainFormData] = useState('');
    return (
        <DemoPage>
            <h1>Demo inline forms</h1>
            <h5>Form data</h5>
            <pre>{mainFormData}</pre>
            <InlineForm<InlineFormCtx>
                config={{
                    onRenderMainWrapper: (n, ctx, state) => {
                        return (
                            <div style={{ backgroundColor: '#009', padding: '1em' }}>
                                <h1>Inlineform</h1>
                                {n}
                                <button
                                    onClick={() => {
                                        setMainFormData(JSON.stringify(state.data.getRef(), null, 2));
                                    }}
                                >
                                    Submit
                                </button>
                            </div>
                        );
                    },
                    form: {
                        isLoading: false,
                        columns: undefined,
                        isInline: true,
                    },
                    controls: [
                        {
                            class: undefined,
                            id: 'name',
                            type: 'text',
                            prop: { label: 'Name' },
                        },
                        {
                            class: undefined,
                            id: 'cb1',
                            type: 'checkBox',
                            prop: { aaa: 3 },
                        },
                    ],
                    onSubmit: undefined,
                    onTranslateHint: undefined,
                    onUpdate: undefined,
                }}
                ctx={{
                    id: 0,
                }}
                data={null}
            ></InlineForm>
        </DemoPage>
    );
}
