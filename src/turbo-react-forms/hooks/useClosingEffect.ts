import { CSSProperties, useEffect, useMemo, useState } from 'react';
import { TClosingEffect, TClosingEffectProps } from '../utils';

const defaultAnimationDuration = 200;
const defaultMode = 'resize';

export function useClosingEffect({
    mode = defaultMode,
    delay = defaultAnimationDuration,
    onClose,
}: TClosingEffectProps) {
    const transition = useMemo(() => {
        return getTransition(mode, delay);
    }, [mode, delay]);

    const initState = useMemo(() => {
        return {
            transition,
            transform: mode == 'resize' ? 'scale(0.5)' : undefined,
            opacity: mode == 'opacity' ? 0.25 : undefined,
        };
    }, []);

    const [style, setStyle] = useState<CSSProperties>(initState);

    useEffect(() => {
        setStyle({
            transition,
            transform: mode == 'resize' ? 'scale(1)' : undefined,
            opacity: mode == 'opacity' ? 1 : undefined,
        });
    }, []);

    return {
        get: function (): CSSProperties {
            return style;
        },
        hide: function (customCloser?: () => void) {
            setStyle(initState);
            setTimeout(() => {
                if (customCloser) {
                    customCloser();
                    return;
                }

                if (onClose) {
                    onClose();
                    return;
                }

                console.warn(
                    'you need to specify either onClose or customCloser'
                );
            }, delay);
        },
    };
}
function getTransition(mode: TClosingEffect, delay: number) {
    switch (mode) {
        case 'resize':
            return `transform ${delay}ms ease`;
        case 'opacity':
            return `opacity ${delay}ms ease`;
    }
}
