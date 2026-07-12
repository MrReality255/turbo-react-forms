import { useClosingEffect } from '../turbo-react-forms';

export function DemoClosingEffect() {
    return (
        <div>
            <h1>Demo Closing Effect</h1>
            <ExampleClosingEffect mode="opacity" />
        </div>
    );
}

function ExampleClosingEffect(p: { mode: 'resize' | 'opacity' }) {
    const ce = useClosingEffect({ delay: 1000, initialState: false, mode: p.mode });

    return (
        <div style={{ ...ce.get(), backgroundColor: '#009', padding: '1em', margin: '1em' }}>
            <h1>This is an example</h1>
            <h2>mode: {p.mode}</h2>
            <p>
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quod.Lorem ipsum dolor sit amet
                consectetur adipisicing elit. Quisquam, quod.Lorem ipsum dolor sit amet consectetur adipisicing elit.
                Quisquam, quod.
            </p>
            <button>Close</button>
        </div>
    );
}
