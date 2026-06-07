import { TValidity } from '..';
import {
    TFormControlCommonProps,
    TFormControlOuterProps,
} from './types_controls';

export type TFormControlWrapperBaseProps = TFormControlOuterProps &
    TFormControlCommonProps & {
        value: string | null;
        valid: TValidity | null;
    };

export type TFormControlWrapperProps = TFormControlWrapperBaseProps & {
    type: string | null;
    class: string | undefined;
};
