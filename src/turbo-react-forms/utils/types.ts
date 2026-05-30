// General
export type TStateHandle<T> = {
    state: T;
    setState: (val: T) => void;
    updateState: (fct: (prev: T) => T) => void;
};

// UI
export type TClosingEffect = 'resize' | 'opacity';
export type TRenderFct<T> = (src: T) => React.ReactNode;
export type TWrapperFct = (content: React.ReactNode) => React.ReactNode;

export type TClosingEffectProps = {
    mode?: TClosingEffect;
    delay?: number;
    onClose?: () => void;
};
