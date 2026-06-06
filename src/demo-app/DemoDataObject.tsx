import {
    DataContainer,
    useClosingEffect,
    useDataObject,
    useNewDataObject,
} from '../turbo-react-forms';
import { DemoPage } from './components/DemoPage';

export function DemoDataObject() {
    const obj = useNewDataObject({});
    return (
        <DemoPage>
            <div>Demo data object</div>
            <h3>Object</h3>
            {JSON.stringify(obj.getRef())}
            <DataContainer data={obj}>
                <Form1></Form1>
            </DataContainer>
        </DemoPage>
    );
}

function Form1() {
    const data = useDataObject();
    return (
        <div>
            <h2>Standard form</h2>
            <h3>Form1</h3>
            <input
                type="text"
                value={data.getRawValue('item1')}
                onChange={(e) =>
                    data.setValue(
                        'item1',
                        e.currentTarget.value,
                        e.currentTarget.value.length > 3
                            ? true
                            : { valid: false, hint: 'too short' }
                    )
                }
            ></input>
            {data.getHint('item1')}
            <h2>Subform</h2>
            <DataContainer data={data} field="subform">
                <Form2></Form2>
            </DataContainer>
            <h2>Template list</h2>
            {data.listItems('template_items').map((itemCtx, idx) => {
                return (
                    <DataContainer data={itemCtx} key={itemCtx.getID()}>
                        <Form3
                            onDelete={() =>
                                data.listRemove('template_items', idx)
                            }
                        ></Form3>
                    </DataContainer>
                );
            })}
            <button
                onClick={() => {
                    data.listAdd('template_items');
                }}
            >
                OnAdd()
            </button>
        </div>
    );
}

function Form2() {
    const data = useDataObject();
    return (
        <div>
            <h3>Form2</h3>
            <input
                type="text"
                value={data.getRawValue('item1')}
                onChange={(e) =>
                    data.setValue(
                        'item1',
                        e.currentTarget.value,
                        e.currentTarget.value.length > 3
                    )
                }
            ></input>
        </div>
    );
}

function Form3(p: { onDelete: () => void }) {
    const data = useDataObject();
    const ce = useClosingEffect({
        mode: 'opacity',
        onClose: () => p.onDelete(),
    });

    return (
        <div style={{ ...ce.get() }}>
            <h3>Template list item: {data.getID()}</h3>
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                }}
            >
                <div>
                    <input
                        type="text"
                        value={data.getRawValue('name')}
                        onChange={(e) =>
                            data.setValue('name', e.currentTarget.value, true)
                        }
                    ></input>
                </div>
                <div>
                    <button onClick={() => ce.hide()}>delete</button>
                </div>
            </div>
        </div>
    );
}
