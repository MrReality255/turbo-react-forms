import { DemoPage } from './components/DemoPage'

import { useLayers } from '../turbo-react-forms'

export function DemoPageLayers() {
    const layers = useLayers()
    return (
        <DemoPage>
            <button
                onClick={() => {
                    layers.show((nr) => {
                        return (
                            <PopupWindow>
                                new window: {nr}
                                <hr></hr>
                                <input type="text"></input>
                                <button onClick={() => layers.hide()}>
                                    Close()
                                </button>
                            </PopupWindow>
                        )
                    })
                }}
            >
                Show a popup window
            </button>
            <button>Show a notification</button>
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
    )
}

function PopupWindow(p: { children?: React.ReactNode }) {
    const l = useLayers()
    return (
        <div
            style={{ width: '640px', height: '480px', backgroundColor: '#400' }}
        >
            Popup window
            <hr></hr>
            {p.children}
            <button
                onClick={() => {
                    l.show((nr) => (
                        <PopupWindow>
                            <input type="text"></input>
                            <h1>{nr}</h1>
                            <button
                                onClick={() => {
                                    l.hide(nr)
                                }}
                            >
                                Close
                            </button>
                        </PopupWindow>
                    ))
                }}
            >
                new popup
            </button>
            <button>Show notification</button>
        </div>
    )
}
