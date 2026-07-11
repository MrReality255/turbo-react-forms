import { CSSProperties, useEffect, useMemo, useState, } from 'react';
import { TClosingEffect, TClosingEffectProps } from '../utils';

const defaultAnimationDuration = 200;
const defaultMode = 'resize';

function getTransitionStyles(mode: TClosingEffect, visible: boolean): CSSProperties {
    switch (mode) {
        case 'resize':
            return {
                transform: visible ? 'scale(1)' : 'scale(0.5)',
            };
        case 'opacity':
            return {
                opacity: visible ? 1 : 0.25,
            };
    }
    return {}
}

function getTransition(mode: TClosingEffect, delay: number) {
    switch (mode) {
        case 'resize':
            return `transform ${delay}ms ease`;
        case 'opacity':
            return `opacity ${delay}ms ease`;
    }
}


export function useClosingEffect({
    mode = defaultMode,
    delay = defaultAnimationDuration,
    initialState
}: TClosingEffectProps) {
    const transition = useMemo(() => {
        return getTransition(mode, delay);
    }, [mode, delay]);

    const [state, setState] = useState({
        visible: initialState ?? true,
        addTransition: false,
        wantChange: false,
    });

    useEffect(() => {
        if (!initialState && !state.visible) {
            show();
        }
    }, [initialState])

    useEffect(() => {
        if (state.wantChange) {
            if (state.visible) {
                setState({
                    addTransition: true,
                    visible: false,
                    wantChange: false,
                })

            } else {
                setTimeout(() => {
                    setState({
                        addTransition: true,
                        visible: true,
                        wantChange: false,
                    })

                }, delay / 10)

            }
        }

    }, [state.wantChange])

    return { get, show, hide }

    function get(): CSSProperties {
        return {
            transition: state.addTransition ? transition : undefined,
            ...getTransitionStyles(mode, state.visible),
        }
    }

    function show() {
        setState({
            addTransition: false,
            visible: false,
            wantChange: true,
        })
    }

    function hide(closer: () => void) {
        setState({
            addTransition: true,
            visible: true,
            wantChange: true
        })

        setTimeout(() => {
            closer()
        }, delay)
    }

}


