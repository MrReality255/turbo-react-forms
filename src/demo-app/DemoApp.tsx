import { HashRouter, Route, Routes } from 'react-router-dom';

import { TAppContainer } from '../turbo-react-forms/app/AppContainer';
import { DemoPageLayers } from './DemoPageLayers';
import { DemoDataObject } from './DemoDataObject';
import { DemoForms } from './DemoForms';
import { DemoClosingEffect } from './DemoClosingEffect';
import { DemoInlineForms } from './DemoInlineForms';

export default function DemoApp() {
    return (
        <TAppContainer>
            <AppRouter />
        </TAppContainer>
    );
}

function AppRouter() {
    return (
        <HashRouter>
            <Routes>
                <Route path="/" element={<Main></Main>}></Route>
                <Route path="/layers" element={<DemoPageLayers></DemoPageLayers>}></Route>
                <Route path="/dataobject" element={<DemoDataObject></DemoDataObject>}></Route>
                <Route path="/forms" element={<DemoForms></DemoForms>}></Route>
                <Route path="/inline-forms" element={<DemoInlineForms></DemoInlineForms>}></Route>
                <Route path="/closing-effect" element={<DemoClosingEffect></DemoClosingEffect>}></Route>
            </Routes>
        </HashRouter>
    );
}

function Main() {
    return <DemoPageLayers />;
}
