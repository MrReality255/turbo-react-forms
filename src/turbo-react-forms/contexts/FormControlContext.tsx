import { createContext } from 'react';
import { TFormControlContext } from './types';

export const ctxFormControl = createContext<TFormControlContext | null>(null);
