export const MiscUtils = {
    delay: function (time: number) {
        return new Promise<void>((resolve) => {
            setTimeout(resolve, time);
        });
    },
};
