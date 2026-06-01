import { DemoMenuItem } from './DemoMenuItem';

export function DemoMenu() {
    return (
        <div className="menu">
            <DemoMenuItem caption="Layers" url="layers"></DemoMenuItem>
            <DemoMenuItem caption="Data Object" url="dataobject"></DemoMenuItem>
            <DemoMenuItem caption="Forms" url="forms"></DemoMenuItem>
        </div>
    );
}
