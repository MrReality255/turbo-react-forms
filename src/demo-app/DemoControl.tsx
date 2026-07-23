import React, { useState, useEffect, useRef } from 'react';
import { DataUtils, TFormControlWrapperProps, useClosingEffect } from '../turbo-react-forms';

export function DemoControl({
    controlProps,
    renderProps,
    children,
    hintTranslator,
    visible,
}: {
    hintTranslator: (h: string | undefined) => string | undefined;
    controlProps: TFormControlWrapperProps;
    children?: React.ReactNode;
    visible: boolean;
    renderProps: { column?: string };
}) {
    const ce = useClosingEffect({
        mode: 'opacity',
        delay: 250,
        initialState: visible,
        initialTargetState: visible,
        id: controlProps.id == 't1' ? 't1' : undefined,
    });
    const [renderContent, setRenderContent] = useState(visible);
    const isFirstRender = useRef(true);

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        if (visible) {
            setRenderContent(true);
            ce.show();
        } else {
            ce.hide(() => {
                setRenderContent(false);
            });
        }
    }, [visible]);

    if (!renderContent) {
        return <></>;
        return <div>invisible</div>;
    }

    return (
        <div style={{ ...ce.get(), gridColumn: renderProps?.column }}>
            {controlProps.context?.top}
            <div
                style={{
                    width: '100%',
                    backgroundColor: '#600',
                    color: '#ff0',
                    padding: '0em',
                }}
            >
                ** CONTROL {controlProps.id} **
                <div>
                    {controlProps.label} - {controlProps.type}/{controlProps.class}
                </div>
            </div>
            <div
                style={{
                    backgroundColor: '#000',
                    paddingTop: '1em',
                    paddingBottom: '1em',
                    paddingLeft: '2em',
                    paddingRight: '2em',
                }}
            >
                {controlProps.context?.before}
                {children}
                {controlProps.context?.after}
                {controlProps.valid ? (
                    <div style={{ color: 'red' }}>{hintTranslator(DataUtils.Validity.getHint(controlProps.valid))}</div>
                ) : null}
            </div>
            {controlProps.context?.bottom}
        </div>
    );
}
