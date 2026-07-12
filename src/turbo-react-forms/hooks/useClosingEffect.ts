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
    height: number | null;
};

function getOpacityTransition(state: TClosingEffectInternalState, delay: number): CSSProperties {
    switch (state.state) {
        case 'prepare':
            return {
                opacity: state.wasOpen ? 1 : 0.25,
            };
        case 'animate':
            return {
                pointerEvents: 'none',
                opacity: state.newOpen ? 1 : 0.25,
                transition: `opacity ${delay}ms cubic-bezier(0.4, 0, 0.2, 1)`,
            };
        case 'finalize':
            return {
                pointerEvents: 'none',
                opacity: state.newOpen ? 1 : 0.25,
            };
        case 'done':
            return {
                opacity: state.wasOpen ? 1 : 0.25,
            };
    }
}

function getResizeTransition(state: TClosingEffectInternalState, delay: number): CSSProperties {
    switch (state.state) {
        case 'prepare':
            return {
                scale: state.wasOpen ? 1 : 0.25,
            };
        case 'animate':
            return {
                scale: state.newOpen ? 1 : 0.25,
                transition: `scale ${delay}ms cubic-bezier(0.4, 0, 0.2, 1)`,
            };
        case 'finalize':
            return {
                scale: state.newOpen ? 1 : 0.25,
            };
        case 'done':
            return {
                scale: state.wasOpen ? 1 : 0.25,
            };
    }
}

function getTransition(mode: TClosingEffect, delay: number, state: TClosingEffectInternalState): CSSProperties {
    switch (mode) {
        case 'opacity':
            return getOpacityTransition(state, delay);
        case 'resize':
            return getResizeTransition(state, delay);
    }
}

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
        height: null,
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
                }, 1);
                setTimeout(() => {
                    setState({ ...state, state: 'finalize' });
                }, 1 + delay);
                return;
            case state.state == 'finalize':
                setTimeout(() => {
                    setState({ ...state, wasOpen: state.newOpen, state: 'done' });
                }, 1);
                return;
        }
    }, [state.state, state.wasOpen, state.wantOpen]);

    return { get, show, hide, getState: () => state };

    function get(): CSSProperties {
        return transition;
    }

    function show() {
        setState((state) => ({
            ...state,
            wantOpen: true,
        }));
    }

    function hide(closer: () => void) {
        setState((state) => ({
            ...state,
            wantOpen: false,
        }));

        setTimeout(() => {
            closer();
        }, delay + 1);
    }
}
