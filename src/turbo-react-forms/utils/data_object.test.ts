import { describe, it, expect } from 'vitest';
import { DataObjectUtils } from './data_object';
import { TDataObjectMap } from '../hooks/types';

describe('DataObjectUtils.isValid', () => {
    it('returns true for an empty data object map', () => {
        const obj: TDataObjectMap = {};
        expect(DataObjectUtils.isValid(obj)).toBe(true);
    });

    it('returns true for a flat data object map with string values', () => {
        const obj: TDataObjectMap = {
            name: 'John Doe',
            email: 'john@example.com',
        };
        expect(DataObjectUtils.isValid(obj)).toBe(true);
    });

    it('returns false if a top-level value is invalid', () => {
        const obj: TDataObjectMap = {
            name: 'John Doe',
            email: {
                type: 'invalid',
                value: 'invalid-email',
                hint: 'Invalid email address',
            },
        };
        expect(DataObjectUtils.isValid(obj)).toBe(false);
    });

    it('returns true for a valid nested object', () => {
        const obj: TDataObjectMap = {
            user: {
                type: 'obj',
                id: 1,
                data: {
                    name: 'John Doe',
                },
            },
        };
        expect(DataObjectUtils.isValid(obj)).toBe(true);
    });

    it('returns false for an invalid nested object', () => {
        const obj: TDataObjectMap = {
            user: {
                type: 'obj',
                id: 1,
                data: {
                    name: {
                        type: 'invalid',
                        value: '',
                        hint: 'Name is required',
                    },
                },
            },
        };
        expect(DataObjectUtils.isValid(obj)).toBe(false);
    });

    it('returns true for a list with only valid objects', () => {
        const obj: TDataObjectMap = {
            users: {
                type: 'list',
                items: [
                    {
                        type: 'obj',
                        id: 1,
                        data: { name: 'John' },
                    },
                    {
                        type: 'obj',
                        id: 2,
                        data: { name: 'Doe' },
                    },
                ],
            },
        };
        expect(DataObjectUtils.isValid(obj)).toBe(true);
    });

    it('returns false for a list with an invalid object', () => {
        const obj: TDataObjectMap = {
            users: {
                type: 'list',
                items: [
                    {
                        type: 'obj',
                        id: 1,
                        data: { name: 'John' },
                    },
                    {
                        type: 'obj',
                        id: 2,
                        data: {
                            name: {
                                type: 'invalid',
                                value: '',
                                hint: 'Name is required',
                            },
                        },
                    },
                ],
            },
        };
        expect(DataObjectUtils.isValid(obj)).toBe(false);
    });
});
