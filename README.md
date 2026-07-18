# turbo-react-forms

A headless, strongly-typed React form library built around a **bring-your-own-UI** philosophy. You define the controls, validators, and rendering wrappers once in a *form library* object; the engine handles state, validation, data flow, subforms, repeating template lists, and modal layers.

- React 19
- Fully typed with TypeScript generics
- Headless — zero default styles, zero opinion on UI components
- Promise-based `show()` API — await a form like a dialog
- Built-in layer/modal manager
- Animated show/hide transitions via `useClosingEffect`

---

## Installation

```bash
npm install @mrreality255/turbo-react-forms
```

**Peer dependencies** (must be installed separately):

```bash
npm install react@^19 react-dom@^19
```

---

## Quick start

### 1. Wrap your app

Wrap the root of your application in `TAppContainer`. This sets up the layer context used by modals.

```tsx
import { TAppContainer } from '@mrreality255/turbo-react-forms';

function App() {
    return (
        <TAppContainer>
            <YourRoutes />
        </TAppContainer>
    );
}
```

### 2. Define a form library

A form library declares the available control types (their render functions), optional validators, and UI wrappers. Create it once and share it across all forms in your project.

```tsx
import { createFormHook, TFormControlBaseProps, TFormTemplateStateProps } from '@mrreality255/turbo-react-forms';

// Your control prop shapes
type TTextProps = { label: string; maxLen: number };
type TTemplateExtraProps = { addText: string };

const MyFormLib = createFormHook({
    // --- Render the outer form shell ---
    onRenderMainWrapper: (content, form: { title: string }) => (
        <div className="form-shell">
            <h2>{form.title}</h2>
            {content}
        </div>
    ),

    // --- Render a repeating template list ---
    onRenderTemplate: (content, stateProps: TFormTemplateStateProps, props: TTemplateExtraProps) => (
        <div>
            {content}
            <button onClick={() => stateProps.triggerAdd()}>{props.addText}</button>
        </div>
    ),
    onRenderTemplateRow: (content, idx, handle, stateProps) => (
        <div key={handle}>
            {content}
            <button onClick={() => stateProps.triggerDelete(idx)}>Delete row</button>
        </div>
    ),
    onRenderTemplateRowControl: (content) => <>{content}</>,

    // --- Render subforms ---
    onRenderSubform: (content) => <div className="subform">{content}</div>,
    onRenderSubformControl: (content, _data, idx) => <div key={idx}>{content}</div>,

    // --- Wrap every individual control (label, hint, etc.) ---
    onRenderControl: (content, visible, controlProps, hintTranslator) => {
        if (!visible) return null;
        const hint = hintTranslator(
            controlProps.valid && typeof controlProps.valid === 'object'
                ? controlProps.valid.hint
                : undefined
        );
        return (
            <div className="control-wrapper">
                {controlProps.label && <label htmlFor={controlProps.id}>{controlProps.label}</label>}
                {content}
                {hint && <span className="hint">{hint}</span>}
            </div>
        );
    },

    // --- Control type definitions ---
    controls: {
        text: {
            onRender: (bp: TFormControlBaseProps, p: TTextProps) => (
                <input
                    id={bp.id}
                    type="text"
                    value={bp.value}
                    maxLength={p.maxLen}
                    disabled={bp.disabled}
                    readOnly={bp.readOnly}
                    onChange={(e) => bp.onValueChange(e.currentTarget.value)}
                />
            ),
        },
        checkBox: {
            forcedDefaultValue: 'false',
            onRender: (bp: TFormControlBaseProps, _p: { label?: string }) => (
                <input
                    id={bp.id}
                    type="checkbox"
                    checked={bp.value === 'true'}
                    onChange={(e) => bp.onValueChange(e.currentTarget.checked ? 'true' : 'false')}
                />
            ),
        },
    },

    // --- Validators (referenced by name from control definitions) ---
    validators: {
        required: (value: string) =>
            value.trim().length > 0 ? true : { valid: false, hint: 'This field is required' },
        max_length: (value: string, props: TTextProps | null) =>
            props && value.length > props.maxLen
                ? { valid: false, hint: `Max ${props.maxLen} characters` }
                : true,
    },
});

// Export the typed hook and list helper for use in form definitions
export type TMyControls = ReturnType<typeof MyFormLib.newEmptyList>;
export const useMyForm = MyFormLib.useForm;
```

### 3. Define and show a form

```tsx
import { useMyForm } from './MyFormLib';

export function UserPage() {
    const form = useMyForm<{ userId: number }, string>({
        // Form-level props (passed to onRenderMainWrapper)
        form: { title: 'Edit User' },

        // Control list — can be static or a function of current state
        controls: [
            {
                id: 'name',
                type: 'text',
                prop: { label: 'Full name', maxLen: 80 },
                validation: 'required',
            },
            {
                id: 'email',
                type: 'text',
                prop: { label: 'Email', maxLen: 120 },
            },
            {
                id: 'active',
                type: 'checkBox',
                prop: {},
                label: 'Active',
            },
        ],

        // Called after the user submits; return close:true to resolve the promise
        onSubmit: async ({ ctx, rawData }) => {
            await saveUser(ctx.userId, rawData.getRef());
            return { id: 'save', close: true, submitData: 'saved' };
        },
    });

    async function handleEdit() {
        const result = await form.show(
            { name: 'Jane', email: 'jane@example.com', active: 'true' }, // initial data
            { userId: 42 }                                                // context
        );
        if (result) {
            console.log('Submitted:', result.submitData, result.rawData.getRef());
        }
    }

    return <button onClick={handleEdit}>Edit user</button>;
}
```

---

## Core concepts

### Data model — `IDataObject`

All form data is stored in an `IDataObject`. Every value is a string internally; the library hands you the raw string on `onRender` and you call `bp.onValueChange(newValue)` to update it.

```ts
// Read a value
data.getValue('email');         // string | null
data.getRawValue('email');      // string (empty string if unset)

// Write a value
data.setValue('email', value, isValid); // isValid: boolean | { valid: false; hint: string }

// Check validity
data.getValidity('email');  // TValidity
data.isValueValid('email'); // boolean
data.isValid();             // true if ALL fields are valid

// Nested object
const sub = data.objectGet('address');
sub.getValue('city');

// Repeating list
data.listAdd('items', () => ({ name: '' }));    // add a row
data.listItems('items');                          // IDataObject[]
data.listRemove('items', idx);                   // remove by index
```

### Form state — `TFormState<Ctx>`

Available in the `controls` and `form` callbacks:

```ts
{
    ctx: Ctx;          // your context object (passed to show())
    data: IDataObject; // live form data
    mode: 'ready' | 'loading' | 'waiting';
    error: TFormError | TFormError[] | undefined;
    handle: number;    // layer handle
}
```

### `onUpdate` — reactive form logic

Return from `onUpdate` to update context, patch data, or auto-submit:

```tsx
onUpdate: (command, event, ctx, data) => {
    if (event.type === 'value' && event.id === 'country') {
        return {
            ctx: { ...ctx, country: event.value },   // update context → re-renders controls
            onUpdateData: (prev) => ({               // patch data object
                ...prev,
                data: { ...prev.data, region: '' },
            }),
        };
    }
},
```

### Control classes

| `class`    | Description |
|------------|-------------|
| *(omit)*   | **Typed** control — `type` maps to a key in your lib's `controls` map |
| `custom`   | Inline render function via `onRender`; full control over the element |
| `dynamic`  | Like typed but `type` is a plain string (no compile-time prop checking) |
| `plain`    | Pure render slot, not backed by a data field |
| `subform`  | Renders a nested group of controls, optionally with its own `IDataObject` |
| `template` | Renders a repeating list of rows with add/delete |

### Conditional controls

Pass a function to `controls` to derive the control list from the current state:

```tsx
controls: (state) => [
    { id: 'email', type: 'text', prop: { label: 'Email', maxLen: 120 } },
    {
        id: 'admin_note',
        type: 'text',
        prop: { label: 'Admin note', maxLen: 500 },
        hidden: state.ctx.role !== 'admin',
    },
],
```

---

## Subform example

```tsx
{
    id: 'address',
    class: 'subform',
    useOwnDataObject: true,   // isolates data under the 'address' key
    subform: {
        controls: [
            { id: 'street', type: 'text', prop: { label: 'Street', maxLen: 100 } },
            { id: 'city',   type: 'text', prop: { label: 'City',   maxLen: 60  } },
        ],
        onWrapControls: (content) => (
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1em' }}>
                {content}
            </div>
        ),
    },
},
```

## Template (repeating list) example

```tsx
{
    id: 'phone_numbers',
    class: 'template',
    template: {
        addText: 'Add phone',   // passed as extra props to onRenderTemplate
        minCount: 1,
        maxCount: 5,
        controls: [
            { id: 'number', type: 'text', prop: { label: 'Number', maxLen: 20 } },
            { id: 'type',   type: 'text', prop: { label: 'Type',   maxLen: 20 } },
        ],
        onWrapRow: (item, stateProps, _state, idx) => (
            <div key={idx} style={{ display: 'flex', gap: '1em' }}>
                {item}
                <button onClick={() => stateProps.triggerDelete(idx)}>✕</button>
            </div>
        ),
    },
},
```

---

## Layers

`TAppContainer` installs a layer manager. Use `useLayers()` to show modal windows and notifications from anywhere in your component tree.

```tsx
import { useLayers, useLayer, TLayer, TLayerContainer } from '@mrreality255/turbo-react-forms';

function SomePage() {
    const layers = useLayers();

    function openModal() {
        layers.main.show((handle) => <MyModal handle={handle} />);
    }

    function showToast() {
        layers.main.showNotification(() => <Toast message="Saved!" />);
    }

    return <button onClick={openModal}>Open modal</button>;
}

function MyModal({ handle }: { handle: number }) {
    const layer = useLayer();

    return (
        // TLayer intercepts hide() calls from the layer manager
        <TLayer onHide={(close) => close()}>
            {/* TLayerContainer lets nested modals stack correctly */}
            <TLayerContainer>
                <div className="modal">
                    <p>Modal #{handle}</p>
                    <button onClick={() => layer.hide()}>Close</button>
                </div>
            </TLayerContainer>
        </TLayer>
    );
}
```

### `useLayers()` API

```ts
const layers = useLayers();

layers.main.show(handle => <Component />);              // open a modal layer
layers.main.showNotification(handle => <Toast />);      // open a notification
layers.main.hide();                                      // close the top modal
layers.main.hideNotification();                          // close the top notification
layers.local.show(...);                                  // scoped to nearest TLayerContainer
```

---

## Animated transitions — `useClosingEffect`

Use `useClosingEffect` to animate any component in/out without fighting CSS:

```tsx
import { useClosingEffect } from '@mrreality255/turbo-react-forms';

function SlidePanel({ onClose }: { onClose: () => void }) {
    const ce = useClosingEffect({ mode: 'resize', delay: 300 });

    return (
        <div style={{ ...ce.get(), overflow: 'hidden' }}>
            Panel content
            <button onClick={() => ce.hide(onClose)}>Close</button>
        </div>
    );
}
```

| Option | Type | Description |
|--------|------|-------------|
| `mode` | `'resize'` \| `'opacity'` \| `'fall'` | Animation style |
| `delay` | `number` | Duration in ms |
| `initialState` | `boolean` | Whether the element starts visible |
| `ref` | `RefObject<HTMLElement>` | DOM ref for resize-based measurements |

| Method | Description |
|--------|-------------|
| `ce.get()` | Returns `CSSProperties` to spread onto your element |
| `ce.show()` | Triggers the open animation |
| `ce.hide(callback)` | Triggers the close animation, calls `callback` when done |

---

## Using `DataContainer` without the form engine

`DataContainer` exposes an `IDataObject` to its children via context. You can use it for any stateful form-like UI without the full `useForm` machinery.

```tsx
import { DataContainer, useDataObject, useNewDataObject } from '@mrreality255/turbo-react-forms';

function StandaloneForm() {
    const root = useNewDataObject({});

    return (
        <DataContainer data={root}>
            <NameField />
        </DataContainer>
    );
}

function NameField() {
    const data = useDataObject();

    return (
        <>
            <input
                value={data.getRawValue('name')}
                onChange={(e) =>
                    data.setValue('name', e.currentTarget.value,
                        e.currentTarget.value.length > 0
                            ? true
                            : { valid: false, hint: 'Required' }
                    )
                }
            />
            <span>{data.getHint('name')}</span>
        </>
    );
}
```

---

## API reference

### `createFormHook(lib)`

Creates a typed form hook bound to your UI library. Returns `{ useForm, newEmptyList }`.

### `useMyForm(config)` → `{ show }`

| `config` key | Description |
|---|---|
| `form` | Static props or `(state) => props` passed to `onRenderMainWrapper` |
| `controls` | Control list or `(state) => list` |
| `onSubmit` | Async function called on submit; return `{ close: true, submitData }` to resolve |
| `onUpdate` | Called on every data change; return context/data patches |
| `onTranslateHint` | Map hint keys to display strings |

### `form.show(initData, ctx, submitFct?)`

Opens the form in a modal layer and returns a `Promise<TFormSubmitCtx | null>`. Resolves when the form is submitted or `null` when cancelled.

### `useFormContext()` (inside a form wrapper)

```ts
const ctx = useFormContext();
ctx.data         // IDataObject — live access to form data
ctx.ctx          // your Ctx value
ctx.close()      // close without submitting
ctx.submit()     // trigger submit programmatically
ctx.hideMethodRef.current = (prev) => { /* animate then call prev() */ }
```

---

## License

MIT — Martin Mojzis
