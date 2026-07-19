export const ViewUtils = {
    wrap,
};

function wrap(content: React.ReactNode, wrapper?: (content: React.ReactNode) => React.ReactNode, cond?: boolean) {
    return wrapper && (cond === undefined || cond) ? wrapper(content) : content;
}
