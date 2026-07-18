import { TValidity } from '..';
import {
    TFormControlCommonProps,
    TFormControlOuterProps,
} from './types_controls';

export type TFormControlWrapperProps = TFormControlOuterProps &
    TFormControlCommonProps & {
        value: string | null;
        valid: TValidity | null;
        type: string | null;
        class: string | undefined;
    };
