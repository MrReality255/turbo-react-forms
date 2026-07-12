import { TFormTemplateStateProps, useClosingEffect } from '../turbo-react-forms';

export function DemoTemplateRow(p: {
    content: React.ReactNode;
    stateProps: TFormTemplateStateProps;
    idx: number;
    handle: number;
    isNew: boolean;
}) {
    const ce = useClosingEffect({ mode: 'opacity', delay: 200, initialState: !p.isNew });
    return (
        <div style={{ ...ce.get(), display: 'flex', gap: '10px' }}>
            <div>{p.isNew ? 'NEW' : 'OLD'}</div>
            <div style={{ flexGrow: 1 }}>{p.content}</div>
            <div style={{ flexShrink: 0, backgroundColor: '#000', alignSelf: 'center', height: '100%' }}>
                <button
                    disabled={p.stateProps.disableDelete}
                    onClick={() => {
                        ce.hide(() => {
                            p.stateProps.triggerDelete(p.idx);
                        });
                    }}
                >
                    Delete
                </button>
            </div>
        </div>
    );
}
