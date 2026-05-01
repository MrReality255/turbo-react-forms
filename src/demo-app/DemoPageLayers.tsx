import { DemoPage } from './components/DemoPage';

import { useLayers } from '../turbo-react-forms';

export function DemoPageLayers() {
  const layers = useLayers();
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
                <button onClick={() => layers.hide()}>Close()</button>
              </PopupWindow>
            );
          });
        }}
      >
        Show a popup window
      </button>
    </DemoPage>
  );
}

function PopupWindow(p: { children?: React.ReactNode }) {
  const l = useLayers();
  return (
    <div style={{ width: '640px', height: '480px', backgroundColor: '#400' }}>
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
    </div>
  );
}
