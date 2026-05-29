import { DemoPage } from './components/DemoPage';
import { useLayers } from '../turbo-react-forms';
import { PropsWithChildren, useEffect } from 'react';
import { TLayerContainer } from '../turbo-react-forms/app/LayerContainer';

export function DemoPageLayers() {
    const layers = useLayers();
    return (
        <DemoPage>
            <button
                onClick={() => {
                    layers.main.show((nr) => {
                        return (
                            <PopupWindow>
                                new window: {nr}
                                <hr></hr>
                                <input type="text"></input>
                                <button onClick={() => layers.hide(nr)}>
                                    Close()
                                </button>
                            </PopupWindow>
                        );
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

function PopupWindow(p: { children?: React.ReactNode }) {
    const l = useLayers();
    return (
        <div
            style={{ width: '640px', height: '480px', backgroundColor: '#400' }}
        >
            <TLayerContainer>
                <PopupWindowContent>{p.children}</PopupWindowContent>
            </TLayerContainer>
        </div>
    );
}

function PopupWindowContent(p: PropsWithChildren) {
    const l = useLayers();
    return (
        <>
            Popup window
            <hr></hr>
            {p.children}
            <button
                onClick={() => {
                    l.main.show((nr) => (
                        <PopupWindow>
                            <input type="text"></input>
                            <h1>{nr}</h1>
                            <button
                                onClick={() => {
                                    l.hide(nr);
                                }}
                            >
                                Close
                            </button>
                        </PopupWindow>
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
    useEffect(() => {
        setTimeout(() => {
            l.hideNotification(h);
        }, 2000);
    }, []);
    return (
        <div
            style={{
                backgroundColor: '#050',
                padding: '1em',
                width: '200px',
            }}
            onClick={() => {
                l.hideNotification(h);
            }}
        >
            My notification. Handle: {h}
        </div>
    );
}
