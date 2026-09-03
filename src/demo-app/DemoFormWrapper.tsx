import { PropsWithChildren } from 'react';
import { useClosingEffect, useFormContext, useLayer, useLayers } from '../turbo-react-forms';
import { useDemoFormContext } from './DemoFormLib';

export type TDemoFormProps = {
    title?: string;
    isLoading: boolean;
    columns?: string;
};

export function DemoFormWrapper(p: PropsWithChildren<TDemoFormProps>) {
    const ctx = useDemoFormContext();
    const l = useLayers();

    return (
        <div style={{ position: 'relative' }}>
            {ctx.formEnv.errorMessage ? (
                <div style={{ color: 'yellow', backgroundColor: 'red' }}>{ctx.formEnv.errorMessage}</div>
            ) : null}
            <h2>Raw data</h2>
            <button onClick={() => showRawData()}>Show</button>
            <div style={{ display: p.columns ? 'grid' : undefined, gridTemplateColumns: p.columns }}>{p.children}</div>
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
