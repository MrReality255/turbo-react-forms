import { HashRouter, Route, Routes } from 'react-router-dom';

import { TAppContainer } from '../turbo-react-forms/app/AppContainer';
import { DemoPageLayers } from './DemoPageLayers';

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
                <Route
                    path="/layers"
                    element={<DemoPageLayers></DemoPageLayers>}
                ></Route>
            </Routes>
        </HashRouter>
    );
}

function Main() {
    return <DemoPageLayers />;
}
