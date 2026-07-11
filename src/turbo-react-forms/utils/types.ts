// General
export type TKey = number | string;
export type TRef<T> = { current: T };
export type THandleProvider = () => number;

export type TStateUpdateHandle<T> = {
    state: T;
    updateState: (fct: (prev: T) => T) => void;
};

export type TStateHandle<T> = TStateUpdateHandle<T> & {
    setState: (val: T) => void;
};

export type TValidity = boolean | { valid: false; hint: string | undefined };

// UI
export type TClosingEffect = 'resize' | 'opacity';
export type TRenderFct<T> = (src: T) => React.ReactNode;
export type TWrapperFct = (content: React.ReactNode) => React.ReactNode;

export type TClosingEffectProps = {
    mode?: TClosingEffect;
    delay?: number;
    initialState?: boolean;
    // onClose?: () => void;
};
