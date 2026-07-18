import { describe, it, expect } from 'vitest';
import { DateTime } from 'luxon';
import { StrUtils } from './strings';
// ---------------------------------------------------------------------------
// StrUtils.classes
// ---------------------------------------------------------------------------

describe('StrUtils.classes', () => {
    it('returns a single string class unchanged', () => {
        expect(StrUtils.classes('foo')).toBe('foo');
    });

    it('joins multiple string classes with a space', () => {
        expect(StrUtils.classes('foo', 'bar', 'baz')).toBe('foo bar baz');
    });

    it('includes only truthy keys from an object', () => {
        expect(StrUtils.classes({ active: true, disabled: false, hidden: true })).toBe('active hidden');
    });

    it('excludes all keys when all values are false', () => {
        expect(StrUtils.classes({ active: false, disabled: false })).toBe('');
    });

    it('mixes strings and objects', () => {
        expect(StrUtils.classes('btn', { primary: true, danger: false })).toBe('btn primary');
    });

    it('deduplicates repeated class names', () => {
        expect(StrUtils.classes('foo', 'foo', 'bar')).toBe('foo bar');
    });

    it('deduplicates classes that appear in both strings and objects', () => {
        expect(StrUtils.classes('active', { active: true, extra: true })).toBe('active extra');
    });

    it('returns empty string when given no arguments', () => {
        expect(StrUtils.classes()).toBe('');
    });

    it('returns empty string for empty object', () => {
        expect(StrUtils.classes({})).toBe('');
    });
});

// ---------------------------------------------------------------------------
// StrUtils.parseDateTime
// ---------------------------------------------------------------------------

describe('StrUtils.parseDateTime', () => {
    describe('undefined input', () => {
        it('returns undefined', () => {
            expect(StrUtils.parseDateTime(undefined)).toBeUndefined();
        });
    });

    describe('number input', () => {
        it('returns undefined for negative numbers', () => {
            expect(StrUtils.parseDateTime(-1)).toBeUndefined();
        });

        it('parses a Unix-seconds timestamp (< 10_000_000_000)', () => {
            const result = StrUtils.parseDateTime(1_700_000_000);

            expect(result).toBeInstanceOf(DateTime);
            expect(result!.isValid).toBe(true);
            expect(result!.toSeconds()).toBe(1_700_000_000);
        });

        it('parses a Unix-milliseconds timestamp (>= 10_000_000_000)', () => {
            const result = StrUtils.parseDateTime(1_700_000_000_000);

            expect(result).toBeInstanceOf(DateTime);
            expect(result!.isValid).toBe(true);
            expect(result!.toMillis()).toBe(1_700_000_000_000);
        });

        it('treats the boundary value 10_000_000_000 as milliseconds', () => {
            const result = StrUtils.parseDateTime(10_000_000_000);

            expect(result).toBeInstanceOf(DateTime);
            expect(result!.toMillis()).toBe(10_000_000_000);
        });
    });

    describe('string input — ISO', () => {
        it('parses a full ISO datetime string', () => {
            const result = StrUtils.parseDateTime('2024-01-15T12:30:00');

            expect(result).toBeInstanceOf(DateTime);
            expect(result!.isValid).toBe(true);
            expect(result!.year).toBe(2024);
            expect(result!.month).toBe(1);
            expect(result!.day).toBe(15);
            expect(result!.hour).toBe(12);
            expect(result!.minute).toBe(30);
        });

        it('parses an ISO date-only string', () => {
            const result = StrUtils.parseDateTime('2024-06-01');

            expect(result).toBeInstanceOf(DateTime);
            expect(result!.isValid).toBe(true);
            expect(result!.year).toBe(2024);
            expect(result!.month).toBe(6);
            expect(result!.day).toBe(1);
        });
    });

    describe('string input — custom formats', () => {
        it('parses dd.MM.yyyy HH:mm:ss', () => {
            const result = StrUtils.parseDateTime('15.01.2024 12:30:00');

            expect(result).toBeInstanceOf(DateTime);
            expect(result!.isValid).toBe(true);
            expect(result!.year).toBe(2024);
            expect(result!.month).toBe(1);
            expect(result!.day).toBe(15);
        });

        it('parses dd.MM.yyyy HH:mm', () => {
            const result = StrUtils.parseDateTime('15.01.2024 12:30');

            expect(result).toBeInstanceOf(DateTime);
            expect(result!.isValid).toBe(true);
            expect(result!.hour).toBe(12);
            expect(result!.minute).toBe(30);
        });

        it('parses dd.MM.yyyy', () => {
            const result = StrUtils.parseDateTime('15.01.2024');

            expect(result).toBeInstanceOf(DateTime);
            expect(result!.isValid).toBe(true);
            expect(result!.year).toBe(2024);
            expect(result!.month).toBe(1);
            expect(result!.day).toBe(15);
        });

        it('parses yyyyMMddHHmmss', () => {
            const result = StrUtils.parseDateTime('20240115123000');

            expect(result).toBeInstanceOf(DateTime);
            expect(result!.isValid).toBe(true);
            expect(result!.year).toBe(2024);
            expect(result!.hour).toBe(12);
        });

        it('parses yyyy-MM-dd HH:mm:ss', () => {
            const result = StrUtils.parseDateTime('2024-01-15 12:30:00');

            expect(result).toBeInstanceOf(DateTime);
            expect(result!.isValid).toBe(true);
            expect(result!.year).toBe(2024);
        });
    });

    describe('string input — invalid', () => {
        it('returns undefined for a garbage string', () => {
            expect(StrUtils.parseDateTime('not-a-date')).toBeUndefined();
        });

        it('returns undefined for an empty string', () => {
            expect(StrUtils.parseDateTime('')).toBeUndefined();
        });
    });
});
