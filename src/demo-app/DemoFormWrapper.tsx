import { PropsWithChildren } from 'react';
import { useClosingEffect, useFormContext, useLayer, useLayers } from '../turbo-react-forms';

export type TDemoFormProps = {
    title: string;
    isLoading: boolean;
};

export function DemoFormWrapper(p: PropsWithChildren<TDemoFormProps>) {
    const ctx = useFormContext();
    const l = useLayers();

    const closer = useClosingEffect({ mode: 'resize', delay: 150, initialState: false });
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
                height: '800px',
                padding: '1em',
                overflow: 'auto',
            }}
        >
            <h1>{p.title}</h1>
            <button onClick={() => ctx.close()}>Close()</button>
            <h2>Raw data</h2>
            <button onClick={() => showRawData()}>Show</button>
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
            <button
                disabled={!ctx.data.isValid()}
                onClick={() => {
                    ctx.submit(undefined);
                }}
            >
                SUBMIT
            </button>
        </div>
    );

    function showRawData() {
        l.main.showNotification(() => <Noticiation>{JSON.stringify(ctx.data.getRef())}</Noticiation>);
    }
}

function Noticiation(p: PropsWithChildren) {
    const l = useLayer();
    const closer = useClosingEffect({ mode: 'resize', delay: 300 });
    return (
        <div
            onClick={() => closer.hide(() => l.hide())}
            style={{
                ...closer.get(),
                backgroundColor: '#033',
                padding: '0.5em',
                maxWidth: '390px',
                overflow: 'auto',
            }}
        >
            {p.children}
        </div>
    );
}
