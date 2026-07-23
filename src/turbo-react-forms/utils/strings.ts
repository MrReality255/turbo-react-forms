import { DateTime } from 'luxon';
import { DataUtils } from './data';

export type CssOption = string | Record<string, boolean>;
export type TDateTimeFormat = 'datetime' | 'date' | 'time';

const dateTimeFormats = [
    'yyyy-MM-dd HH:mm:ss',
    'dd.MM.yyyy HH:mm:ss',
    'dd.MM.yyyy HH:mm',
    'yyyyMMdd HHmmss',
    'yyyyMMddHHmmss',
    'yyyy-MM-dd',
    'dd.MM.yyyy',
    'dd.MM.yy',
    'yyyyMMdd',
];

export const StrUtils = {
    classes: function (...options: CssOption[]) {
        const strOptions = options.map((item) => {
            if (typeof item === 'string') {
                return [item];
            }

            return Object.entries(item)
                .filter((c) => c[1])
                .map((c) => c[0]);
        });

        return DataUtils.distinct(strOptions.flat()).join(' ');
    },

    formatDateTime: function (x: DateTime | string | number | undefined, fmt: TDateTimeFormat) {
        if (typeof x !== 'object') {
            x = StrUtils.parseDateTime(x);
        }
        return formatDateTime(x, fmt);
    },

    parseDateTime: function (x: string | number | undefined): DateTime | undefined {
        switch (typeof x) {
            case 'undefined':
                return undefined;
            case 'number':
                return parseDateTimeNr(x);
            case 'string':
                return parseDateTimeStr(x);
        }
    },
};

function formatDateTime(dt: DateTime | undefined, fmt: TDateTimeFormat) {
    if (!dt || dt.toUnixInteger() == 0) {
        return '--';
    }

    switch (fmt) {
        case 'datetime':
            return dt.toLocaleString({ dateStyle: 'short', timeStyle: 'medium' });
        case 'date':
            return dt.toLocaleString({ dateStyle: 'short' });
        case 'time':
            return dt.toLocaleString({ timeStyle: 'medium' });
    }
}

function parseDateTimeNr(x: number): DateTime | undefined {
    switch (true) {
        case x < 0:
            return undefined;
        case x < 10000000000:
            return DateTime.fromSeconds(x);
        default:
            return DateTime.fromMillis(x);
    }
}

function parseDateTimeStr(dtStr: string): DateTime | undefined {
    const fcts = [
        DateTime.fromISO,
        function (x: string) {
            for (let i = 0; i < dateTimeFormats.length; i++) {
                const fmt = dateTimeFormats[i];
                const dt = DateTime.fromFormat(x, fmt);
                if (dt.isValid) {
                    return dt;
                }
            }
            return undefined;
        },
    ];

    for (let i = 0; i < fcts.length; i++) {
        const dt = fcts[i](dtStr);
        if (dt && dt.isValid) {
            return dt;
        }
    }

    return undefined;
}
