import { CSSProperties, useEffect, useMemo, useState } from 'react';
import { TClosingEffect, TClosingEffectProps } from '../utils';

const defaultAnimationDuration = 200;
const defaultMode = 'resize';

type TClosingEffectState = 'prepare' | 'animate' | 'finalize' | 'done';
type TClosingEffectInternalState = {
    state: TClosingEffectState;
    wantOpen: boolean;
    wasOpen: boolean;
    newOpen: boolean;
};

function getOpacityTransition(state: TClosingEffectInternalState, delay: number): CSSProperties {
    switch (state.state) {
        case 'prepare':
            return {
                opacity: state.wasOpen ? 1 : 0.25,
            };
        case 'animate':
            return {
                opacity: state.newOpen ? 1 : 0.25,
                transition: `opacity ${delay}ms ease`,
            };
        case 'done':
            return {
                opacity: state.wasOpen ? 1 : 0.25,
            };
    }
    return {};
}

function getResizeTransition(state: TClosingEffectInternalState, delay: number): CSSProperties {
    return {};
}

function getTransition(mode: TClosingEffect, delay: number, state: TClosingEffectInternalState): CSSProperties {
    switch (mode) {
        case 'opacity':
            return getOpacityTransition(state, delay);
        case 'resize':
            return getResizeTransition(state, delay);
    }
}

/*
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
*/

export function useClosingEffect({
    mode = defaultMode,
    delay = defaultAnimationDuration,
    initialState,
}: TClosingEffectProps) {
    const [state, setState] = useState<TClosingEffectInternalState>({
        state: 'done',
        wantOpen: true,
        wasOpen: initialState ?? true,
        newOpen: initialState ?? true,
    });

    const transition = useMemo(() => {
        return getTransition(mode, delay, state);
    }, [mode, delay, state]);

    useEffect(() => {
        switch (true) {
            case state.state == 'done' && state.wasOpen != state.wantOpen:
                setState({ ...state, state: 'prepare', newOpen: state.wantOpen });
                return;
            case state.state == 'prepare':
                setTimeout(() => {
                    setState({ ...state, state: 'animate' });
                }, 1000);
                return;
        }
    }, [state.state, state.wasOpen, state.wantOpen]);

    console.log('closingEffect', JSON.stringify(state, null, 2));

    return { get, show, hide };

    function get(): CSSProperties {
        return transition;
    }

    function show() {
        setState({
            ...state,
            wantOpen: true,
        });
    }

    function hide(closer: () => void) {
        setState({
            ...state,
            wantOpen: false,
        });

        setTimeout(() => {
            closer();
        }, delay);
    }
}
