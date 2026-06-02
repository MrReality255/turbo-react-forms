import { createContext } from 'react';
import { TFormContext } from './types';

export const ctxForm = createContext<TFormContext<any> | null>(null);
