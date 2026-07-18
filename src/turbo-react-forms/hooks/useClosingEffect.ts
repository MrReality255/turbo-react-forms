import { CSSProperties, useEffect, useMemo, useState } from 'react';
import { TClosingEffect, TClosingEffectProps } from '../utils';

const defaultAnimationDuration = 200;
const defaultMode = 'resize';

type TClosingEffectPhase = 'prepare' | 'animate' | 'finalize' | 'done';
type TClosingEffectInternalState = {
    phase: TClosingEffectPhase;
    wantOpen: boolean;
    wasOpen: boolean;
    newOpen: boolean;
};

function getOpacityTransition(state: TClosingEffectInternalState, delay: number): CSSProperties {
    switch (state.phase) {
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
        default:
            return {};
    }
}

function getFallTranslation(state: TClosingEffectInternalState, delay: number): CSSProperties {
    switch (state.phase) {
        case 'prepare':
            return {
                transform: state.wasOpen ? 'translateY(0)' : 'translateY(-150%)',
            };
        case 'animate':
            return {
                transform: state.newOpen ? 'translateY(0)' : 'translateY(-150%)',
                transition: `transform ${delay}ms cubic-bezier(0.4, 0, 0.2, 1)`,
            };
        case 'finalize':
            return {
                transform: state.newOpen ? 'translateY(0)' : 'translateY(-150%)',
            };
        case 'done':
            return {
                transform: state.newOpen ? 'translateY(0)' : 'translateY(-150%)',
            };
        default:
            return {};
    }
}

function getResizeTransition(state: TClosingEffectInternalState, delay: number): CSSProperties {
    switch (state.phase) {
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
        default:
            return {};
    }
}

function getTransition(mode: TClosingEffect, delay: number, state: TClosingEffectInternalState): CSSProperties {
    switch (mode) {
        case 'opacity':
            return getOpacityTransition(state, delay);
        case 'resize':
            return getResizeTransition(state, delay);
        case 'fall':
            return getFallTranslation(state, delay);
    }
}

export function useClosingEffect({
    mode = defaultMode,
    delay = defaultAnimationDuration,
    initialState = true,
    initialTargetState = true,
    id,
}: TClosingEffectProps) {
    const [state, setState] = useState<TClosingEffectInternalState>({
        phase: 'done',
        wantOpen: initialTargetState,
        wasOpen: initialState,
        newOpen: initialState,
    });

    const transition = useMemo(() => {
        return getTransition(mode, delay, state);
    }, [mode, delay, state]);

    if (id) {
        console.log(
            'closing effect state',
            id,
            ':',
            JSON.stringify(
                {
                    state,
                    css: get(),
                },
                null,
                2
            )
        );
    }

    useEffect(() => {
        switch (true) {
            case state.phase == 'done' && state.wasOpen != state.wantOpen:
                setState({ ...state, phase: 'prepare', newOpen: state.wantOpen });
                return;
            case state.phase == 'prepare':
                setTimeout(() => {
                    setState({ ...state, phase: 'animate' });
                }, delay / 10);
                setTimeout(() => {
                    setState({ ...state, phase: 'finalize' });
                }, 1 + delay);
                return;
            case state.phase == 'finalize':
                setTimeout(() => {
                    setState({ ...state, wasOpen: state.newOpen, phase: 'done' });
                }, 1);
                return;
        }
    }, [state.phase, state.wasOpen, state.wantOpen]);

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
