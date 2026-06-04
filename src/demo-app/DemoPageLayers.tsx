import { DemoPage } from './components/DemoPage';
import {
    TLayer,
    TLayerContainer,
    useClosingEffect,
    useLayer,
    useLayers,
} from '../turbo-react-forms';
import { PropsWithChildren, useEffect } from 'react';

export function DemoPageLayers() {
    const layers = useLayers();
    return (
        <DemoPage>
            <button
                onClick={() => {
                    layers.main.show((nr) => {
                        return <PopupWindow handle={nr}></PopupWindow>;
                    });
                }}
            >
                Show a popup window
            </button>
            <button
                onClick={() => {
                    layers.main.showNotification((nr) => (
                        <Notification h={nr}></Notification>
                    ));
                }}
            >
                Show a notification
            </button>
            <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
                enim ad minim veniam, quis nostrud exercitation ullamco laboris
                nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor
                in reprehenderit in voluptate velit esse cillum dolore eu fugiat
                nulla pariatur. Excepteur sint occaecat cupidatat non proident,
                sunt in culpa qui officia deserunt mollit anim id est laborum.
                Curabitur pretium tincidunt lacus. Nulla gravida orci a odio.
                Nullam varius, turpis et commodo pharetra, est eros bibendum
                elit. Aliquam erat volutpat. Nam dui ligula, fringilla a,
                euismod sodales. Pellentesque habitant morbi tristique senectus
                et netus et malesuada fames ac turpis egestas. Vestibulum tortor
                quam, feugiat vitae, ultricies eget, tempor sit amet, ante.
                Donec eu libero sit amet quam egestas semper. Aenean ultricies
                mi vitae est. Mauris placerat eleifend leo.
            </p>
        </DemoPage>
    );
}

function PopupWindow({ handle: nr }: { handle: number }) {
    return (
        <PopupWindowWrapper handle={nr}>
            new window: {nr}
            <hr></hr>
            <input type="text"></input>
        </PopupWindowWrapper>
    );
}

function PopupWindowLocal({ handle }: { handle: number }) {
    const l = useLayers();
    return (
        <PopupWindowWrapper handle={handle}>
            <input type="text"></input>
            <h1>{handle}</h1>
        </PopupWindowWrapper>
    );
}

function PopupWindowWrapper(p: { children?: React.ReactNode; handle: number }) {
    const l = useLayers();
    const e = useClosingEffect({
        delay: 200,
        onClose: () => {
            l.hide(p.handle);
        },
    });

    return (
        <TLayer onClose={() => e.hide()}>
            <div
                style={{
                    ...e.get(),
                    width: '640px',
                    height: '480px',
                    backgroundColor: '#400',
                    position: 'relative',
                }}
            >
                <TLayerContainer>
                    Handle: {p.handle}
                    <PopupWindowContent>{p.children}</PopupWindowContent>
                </TLayerContainer>
            </div>
        </TLayer>
    );
}

function PopupWindowContent(p: PropsWithChildren) {
    const l = useLayers();
    const la = useLayer();

    return (
        <>
            Popup window
            <hr></hr>
            {p.children}
            <button onClick={() => la.onClose!()}>OnClose()</button>
            <button
                onClick={() => {
                    l.main.show((nr) => (
                        <PopupWindowLocal handle={nr}></PopupWindowLocal>
                    ));
                }}
            >
                new popup
            </button>
            <button
                onClick={() => {
                    l.main.showNotification((h) => {
                        return <Notification h={h}></Notification>;
                    });
                }}
            >
                Show notification
            </button>
            <button
                onClick={() => {
                    l.local.show((nr) => {
                        return <LocalLayer handle={nr}></LocalLayer>;
                    });
                }}
            >
                Show local layer
            </button>
            <button
                onClick={() => {
                    l.local.showNotification((nr) => (
                        <Notification h={nr}></Notification>
                    ));
                }}
            >
                Show local notification
            </button>
        </>
    );
}

function LocalLayer({ handle }: { handle: number }) {
    const l = useLayers();

    useEffect(() => {
        setTimeout(() => {
            l.hide(handle);
        }, 2000);
    }, []);

    return (
        <div
            style={{
                width: '100%',
                height: '100%',
                backgroundColor: '#ff0',
                opacity: 0.5,
            }}
        >
            Local layer
        </div>
    );
}

function Notification({ h }: { h: number }) {
    const l = useLayers();
    const ce = useClosingEffect({
        mode: 'opacity',
        delay: 200,
        onClose: () => l.hideNotification(),
    });
    useEffect(() => {
        setTimeout(() => {
            ce.hide();
        }, 2000);
    }, []);
    return (
        <div
            style={{
                ...ce.get(),
                backgroundColor: '#050',
                padding: '1em',
                width: '200px',
            }}
            onClick={() => {
                ce.hide();
            }}
        >
            My notification. Handle: {h}
        </div>
    );
}
