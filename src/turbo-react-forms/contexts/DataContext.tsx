import { createContext } from 'react';
import { IDataObject } from '../hooks';

export const ctxDataObject = createContext<IDataObject | null>(null);
