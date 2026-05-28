import { useNavigate } from 'react-router-dom';
import { DemoMenuItemProps } from './components/types';

export function DemoMenuItem(p: DemoMenuItemProps) {
    const n = useNavigate();
    return (
        <button
            onClick={() => {
                n(`/${p.url}`);
            }}
        >
            {p.caption}
        </button>
    );
}
