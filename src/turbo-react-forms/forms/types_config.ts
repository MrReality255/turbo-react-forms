import {
    TFormControlList,
    TFormControlSpecificProps,
    TFormState,
    TFormSubformPropsType,
    TFormTemplatePropsType,
} from '.';
import { TDataObject, TDataObjectEvent } from '..';
import { TFormSubmitFct, TFormSubmitFctData } from './types_submit';

export type TFormConfig<
    P extends Record<string, unknown>,
    V extends Record<string, unknown>,
    F extends Record<string, unknown>,
    TT extends TFormTemplatePropsType,
    SFT extends TFormSubformPropsType,
    Ctx,
    SubmitType,
> = {
    form: F | ((state: TFormState<Ctx>) => F);
    controls: TFormControlList<P, V, TT, SFT, Ctx> | ((state: TFormState<Ctx>) => TFormControlList<P, V, TT, SFT, Ctx>);
    onRenderMainWrapper?: (content: React.ReactNode, ctx: Ctx, state: TFormState<Ctx>) => React.ReactNode;
    onSubmit?: TFormSubmitFct<Ctx, SubmitType>;
    onTranslateHint?: (hint: string, id: string, props: TFormControlSpecificProps<P, V, TT, SFT, Ctx> | null) => string;
    onUpdate?: (
        command: string | null,
        event: TDataObjectEvent,
        ctx: Ctx,
        data: TDataObject
    ) => TFormUpdateContext<Ctx, SubmitType> | undefined | Promise<TFormUpdateContext<Ctx, SubmitType> | undefined>;
};

export type TFormUpdateContext<Ctx, SubmitType> = {
    ctx?: Ctx;
    modalResult?: TFormSubmitFctData<Ctx, SubmitType>;

    onUpdateData?: (prev: TDataObject) => TDataObject;
};
