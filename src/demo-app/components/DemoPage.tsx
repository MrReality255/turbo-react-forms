import { DemoPageProps } from './types';

import './DemoPage.css';
import { DemoMenu } from '../DemoMenu';

export function DemoPage(p: DemoPageProps) {
  return (
    <div>
      <div>
        <h1>TurboReactForms</h1>
        <DemoMenu></DemoMenu>
        <div>{p.children}</div>
      </div>
    </div>
  );
}
