import { useRef } from 'react';
import { TClosingEffect, useClosingEffect } from '../turbo-react-forms';
import { DemoPage } from './components/DemoPage';

export function DemoClosingEffect() {
    return (
        <DemoPage>
            <div>
                <h1>Demo Closing Effect</h1>
                <ExampleClosingEffect mode="fall" />
                <ExampleClosingEffect mode="resize" />
                <ExampleClosingEffect mode="opacity" />
            </div>
        </DemoPage>
    );
}

function ExampleClosingEffect(p: { mode: TClosingEffect }) {
    const ce = useClosingEffect({ delay: 1400, initialState: false, mode: p.mode });

    return (
        <div style={{ ...ce.get(), backgroundColor: '#009', padding: '1em', margin: '1em' }}>
            <h1>This is an example</h1>
            <h2>mode: {p.mode}</h2>
            <pre>{JSON.stringify(ce.get(), null, 2)}</pre>
            <pre>{JSON.stringify(ce.getState(), null, 2)}</pre>
            <p>
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quod.Lorem ipsum dolor sit amet
                consectetur adipisicing elit. Quisquam, quod.Lorem ipsum dolor sit amet consectetur adipisicing elit.
                Quisquam, quod.
            </p>
            <button
                onClick={() =>
                    ce.hide(() => {
                        setTimeout(() => {
                            ce.show();
                        }, 5000);
                    })
                }
            >
                Close
            </button>
        </div>
    );
}
