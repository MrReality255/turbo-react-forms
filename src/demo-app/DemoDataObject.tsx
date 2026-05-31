import {
    DataContainer,
    useDataObject,
    useNewDataObject,
} from '../turbo-react-forms';
import { DemoPage } from './components/DemoPage';

export function DemoDataObject() {
    const obj = useNewDataObject();
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
            <h3>Form1</h3>
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
            <h3>Subform</h3>
            <DataContainer data={data} key="subform">
                <Form2></Form2>
            </DataContainer>
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
