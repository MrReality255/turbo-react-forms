export type TWrapperFct = (content: React.ReactNode) => React.ReactNode;
export type TRenderFct<T> = (src: T) => React.ReactNode;
export type TStateHandle<T> = {
    state: T;
    setState: (val: T) => void;
    updateState: (fct: (prev: T) => T) => void;
};
