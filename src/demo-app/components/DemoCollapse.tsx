import { useClosingEffect } from "../../turbo-react-forms"

export function DemoCollapse(p: {
    children?: React.ReactNode
}) {
    const ce = useClosingEffect({ mode: 'opacity', delay: 500 })

    return <div style={{ ...ce.get() }}>
        {p.children}
    </div>
}