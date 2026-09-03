import { PropsWithChildren } from 'react';
import { useClosingEffect, useFormContext, useLayer, useLayers } from '../turbo-react-forms';
import { useDemoFormContext } from './DemoFormLib';

export type TDemoFormContainerProps = {
    title?: string;
};

export function DemoFormContainer(p: PropsWithChildren<TDemoFormContainerProps>) {
    const ctx = useDemoFormContext();
    const l = useLayers();

    const closer = useClosingEffect({ mode: 'resize', delay: 350, initialState: false });
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
            {p.title !== undefined ? <h1>{p.title}</h1> : null}
            <button onClick={() => ctx.close()}>Close()</button>
            {p.children}
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
        l.main.showNotification(() => <Notification>{JSON.stringify(ctx.data.getRef())}</Notification>);
    }
}

function Notification(p: PropsWithChildren) {
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
