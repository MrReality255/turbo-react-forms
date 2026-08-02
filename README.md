# turbo-react-forms

A headless, strongly-typed React form library built around a **bring-your-own-UI** philosophy. You define the controls, validators, and rendering wrappers once in a _form library_ object; the engine handles state, validation, data flow, subforms, repeating template lists, and modal layers.

- React 19
- Fully typed with TypeScript generics
- Headless — zero default styles, zero opinion on UI components
- Promise-based `show()` API — await a form like a dialog
- Built-in layer/modal manager
- Animated show/hide transitions via `useClosingEffect`
- Form-level environment state (`FormEnv`)
- Command system with async support

---

## Installation

```bash
npm install @mrreality255/turbo-react-forms
```

**Peer dependencies** (must be installed separately):

```bash
npm install react@^19 react-dom@^19
```

**Optional peer dependencies:**

```bash
npm install luxon@^3    # required only if you use StrUtils date/time helpers
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
type TRenderProps = { column?: string };
type TFormEnv = { theme: 'light' | 'dark' };

const MyFormLib = createFormHook({
    // --- Initialize form environment (optional) ---
    onInit: () => ({ theme: 'light' }) satisfies TFormEnv,

    // --- Render the outer form shell ---
    onRenderMainWrapper: (content, form: { title: string }, state, formEnv) => (
        <div className={`form-shell ${formEnv.theme}`}>
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
    onRenderTemplateRow: (content, idx, handle, stateProps, props, isNew) => (
        <div key={handle}>
            {content}
            <button onClick={() => stateProps.triggerDelete(idx)}>Delete row</button>
        </div>
    ),
    onRenderTemplateRowControl: (content, rowIdx, stateProps, renderProps) => (
        <div style={{ gridColumn: renderProps?.column }}>{content}</div>
    ),

    // --- Render subforms ---
    onRenderSubform: (content) => <div className="subform">{content}</div>,
    onRenderSubformControl: (content, _data, idx, renderProps) => (
        <div key={idx} style={{ gridColumn: renderProps?.column }}>
            {content}
        </div>
    ),

    // --- Wrap every individual control (label, hint, etc.) ---
    onRenderControl: (content, visible, controlProps, renderProps, hintTranslator) => {
        if (!visible) return null;
        const hint = hintTranslator(
            controlProps.valid && typeof controlProps.valid === 'object' ? controlProps.valid.hint : undefined
        );
        return (
            <div className="control-wrapper" style={{ gridColumn: renderProps?.column }}>
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
            props && value.length > props.maxLen ? { valid: false, hint: `Max ${props.maxLen} characters` } : true,
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
                renderProps: { column: '1 / 3' },
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
            return { id: 'save', submitData: 'saved' };
        },
    });

    async function handleEdit() {
        const result = await form.show(
            { name: 'Jane', email: 'jane@example.com', active: 'true' }, // initial data
            { userId: 42 } // context
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
data.getValue('email'); // string | null
data.getRawValue('email'); // string (empty string if unset)

// Write a value
data.setValue('email', value, isValid); // isValid: boolean | { valid: false; hint: string }

// Check validity
data.getValidity('email'); // TValidity
data.isValueValid('email'); // boolean
data.isValid(); // true if ALL fields are valid

// Nested object
const sub = data.objectGet('address');
sub.getValue('city');

// Repeating list
data.listAdd('items', () => ({ name: '' })); // add a row
data.listItems('items'); // IDataObject[]
data.listRemove('items', idx); // remove by index
data.listGet('items', idx); // IDataObject at index
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

### Form environment — `FormEnv`

A form-scoped state object for data that lives outside the form's data model (e.g. lookup tables, UI preferences, configuration fetched during the form's lifetime). It is initialized via `onInit` in the form library and accessible/updatable from multiple points:

```tsx
// In the form library
const lib = createFormHook({
    onInit: () => ({ lookups: [], theme: 'light' }),
    onRenderMainWrapper: (content, props, state, formEnv) => {
        /* use formEnv here */
    },
    // ...
});

// In the form context (inside a rendered form)
const ctx = useFormContext();
ctx.formEnv; // current FormEnv value
ctx.setFormEnv(newEnv); // replace
ctx.setFormEnv((prev) => ({ ...prev, theme: 'dark' })); // updater

// From onUpdate return value
onUpdate: (cmd, event, ctx, data) => {
    return {
        onUpdateEnv: (prev) => ({ ...prev, lookups: newLookups }),
    };
};

// From onSubmit return value
onSubmit: async ({ ctx, rawData }) => {
    return {
        submitData: 'ok',
        ctxUpdateEnv: (prev) => ({ ...prev, submitted: true }),
        preventClose: true,
    };
};
```

### Command context — `TFormCommandCtx`

The command context is passed to the `controls` and `form` callbacks (when they are functions). It provides imperative actions for use in control event handlers:

```ts
type TFormCommandCtx = {
    command: (cmd: TFormCommand) => void; // trigger a command (processed by onUpdate)
    submit: () => void; // programmatic submit
    cancel: () => void; // close form without submitting
    loading: <T>(loadFct: () => Promise<T>, onDone?: (result: T) => void) => void;
};
```

Usage in a dynamic controls function:

```tsx
controls: (state, cmdCtx) => [
    {
        id: 'save_btn',
        class: 'plain',
        onRender: () => (
            <button onClick={() => cmdCtx.submit()}>Save</button>
        ),
    },
    {
        id: 'refresh_btn',
        class: 'plain',
        onRender: () => (
            <button onClick={() => cmdCtx.loading(
                () => fetchLatestData(),
                (data) => cmdCtx.command({ id: 'refreshed', data })
            )}>
                Refresh
            </button>
        ),
    },
],
```

### `triggerCommand` — commands and async commands

Commands are the primary way to drive form logic from control interactions. They flow through `onUpdate` where you can react to them by updating context, data, or environment.

Commands can be synchronous (a string or `{ id, data }` object) or asynchronous (a `Promise<TFormCommand>`). When a promise is passed, the form automatically enters `'loading'` mode and switches back to `'ready'` once the command resolves.

```tsx
// From the form context (inside a rendered control)
const ctx = useFormContext();
ctx.triggerCommand('refresh'); // sync
ctx.triggerCommand({ id: 'load_item', data: itemId }); // sync with data
ctx.triggerCommand(
    fetchItem(itemId).then((item) =>
        // async
        ({ id: 'item_loaded', data: item })
    )
);
```

### `triggerLoading` — arbitrary async work

Run any async operation while the form shows a loading state. Unlike commands, the result doesn't flow through `onUpdate` — you handle it directly in the callback:

```tsx
const ctx = useFormContext();
ctx.triggerLoading(
    () => api.fetchOptions(),
    (options) => {
        // update form data, context, etc.
        ctx.setFormEnv((prev) => ({ ...prev, options }));
    }
);
```

### `onSubmit` on config vs. `show()`

`onSubmit` can be defined either on the config object (shared across all invocations) or passed as a third argument to `show()` (per-invocation). The per-invocation handler takes precedence:

```tsx
const form = useMyForm<Ctx, string>({
    // Default submit handler for all invocations
    onSubmit: async ({ ctx, rawData }) => {
        await saveDefault(ctx, rawData);
        return { submitData: 'saved' };
    },
    // ...
});

// Uses default onSubmit from config
await form.show(data, ctx);

// Overrides with a custom handler for this invocation
await form.show(data, ctx, async ({ ctx, rawData }) => {
    await saveSpecial(ctx, rawData);
    return { submitData: 'special' };
});
```

If no `onSubmit` is defined at either level, calling `submit()` simply closes the form.

### `onUpdate` — reactive form logic

Return from `onUpdate` to update context, patch data, update the environment, or auto-submit. `onUpdate` can also return a `Promise` — the form enters `'waiting'` mode until it resolves.

```tsx
onUpdate: (command, event, ctx, data) => {
    // React to value changes
    if (event?.type === 'value' && event.id === 'country') {
        return {
            ctx: { ...ctx, country: event.value },
            onUpdateData: (prev, replacerFct) => {
                return replacerFct((obj) => obj.setValue('region', '', true));
            },
        };
    }

    // React to commands
    if (command?.id === 'item_loaded') {
        return {
            ctx: { ...ctx, item: command.data },
            onUpdateEnv: (prev) => ({ ...prev, lastLoaded: Date.now() }),
        };
    }

    // Async update — form shows 'waiting' mode until resolved
    if (command?.id === 'fetch_details') {
        return api.getDetails(ctx.id).then(details => ({
            ctx: { ...ctx, details },
        }));
    }
},
```

### `renderProps` — per-control render metadata

Every control (typed, custom, dynamic, plain, subform, template) can carry a `renderProps` object. This object is passed through to the library's render callbacks (`onRenderControl`, `onRenderSubformControl`, `onRenderTemplateRowControl`) so you can customize layout without polluting control-specific props:

```tsx
controls: [
    {
        id: 'name',
        type: 'text',
        prop: { label: 'Name', maxLen: 80 },
        renderProps: { column: '1 / 3' },  // spans full width in a grid
    },
    {
        id: 'notes',
        class: 'plain',
        onRender: () => <p>Additional info</p>,
        renderProps: { column: '1 / 3' },
    },
],
```

The `RP` generic parameter on your form library types constrains what shape `renderProps` can take.

### Control classes

| `class`    | Description                                                               |
| ---------- | ------------------------------------------------------------------------- |
| _(omit)_   | **Typed** control — `type` maps to a key in your lib's `controls` map     |
| `custom`   | Inline render function via `onRender`; full control over the element      |
| `dynamic`  | Like typed but `type` is a plain string (no compile-time prop checking)   |
| `plain`    | Pure render slot, not backed by a data field                              |
| `subform`  | Renders a nested group of controls, optionally with its own `IDataObject` |
| `template` | Renders a repeating list of rows with add/delete                          |

### Conditional controls

Pass a function to `controls` to derive the control list from the current state. The second argument is the command context:

```tsx
controls: (state, cmdCtx) => [
    { id: 'email', type: 'text', prop: { label: 'Email', maxLen: 120 } },
    {
        id: 'admin_note',
        type: 'text',
        prop: { label: 'Admin note', maxLen: 500 },
        hidden: state.ctx.role !== 'admin',
    },
    state.data.isValid()
        ? { class: 'plain', onRender: () => <div>All valid</div> }
        : null,
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
                <button onClick={() => stateProps.triggerDelete(idx)}>x</button>
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
    const ce = useClosingEffect({ mode: 'fall', delay: 300 });

    return (
        <div style={{ ...ce.get(), overflow: 'hidden' }}>
            Panel content
            <button onClick={() => ce.hide(onClose)}>Close</button>
        </div>
    );
}
```

### Declarative visibility

You can control the animation declaratively via the `visible` prop. The hook manages the enter/exit animation and exposes `isVisible` for conditional rendering:

```tsx
function AnimatedSection({ open }: { open: boolean }) {
    const ce = useClosingEffect({ mode: 'opacity', delay: 200, visible: open });

    if (!ce.isVisible) return null;

    return <div style={ce.get()}>Content</div>;
}
```

### Options

| Option               | Type                                  | Description                                          |
| -------------------- | ------------------------------------- | ---------------------------------------------------- |
| `mode`               | `'resize'` \| `'opacity'` \| `'fall'` | Animation style                                      |
| `delay`              | `number`                              | Duration in ms (default: 200)                        |
| `initialState`       | `boolean`                             | Whether the element starts in the open visual state  |
| `initialTargetState` | `boolean`                             | The desired open/closed state at mount               |
| `visible`            | `boolean`                             | Declarative control — drives show/hide automatically |
| `id`                 | `string`                              | Debug identifier (logs animation state to console)   |

### Returned object

| Property/Method     | Description                                                          |
| ------------------- | -------------------------------------------------------------------- |
| `ce.get()`          | Returns `CSSProperties` to spread onto your element                  |
| `ce.show()`         | Triggers the open animation (imperative)                             |
| `ce.hide(callback)` | Triggers the close animation, calls `callback` when done             |
| `ce.isVisible`      | `boolean \| undefined` — tracks visibility when using `visible` prop |
| `ce.getState()`     | Returns internal animation phase state (for advanced use)            |

---

## Utility exports

### `ViewUtils`

Conditional content wrapping helper:

```ts
import { ViewUtils } from '@mrreality255/turbo-react-forms';

// Wraps content with the wrapper function only if the condition is true (or omitted)
ViewUtils.wrap(content, wrapperFct, condition);
```

### `MiscUtils`

General-purpose utilities:

```ts
import { MiscUtils } from '@mrreality255/turbo-react-forms';

await MiscUtils.delay(500); // promise that resolves after 500ms
```

### `StrUtils`

String/CSS/DateTime utilities (datetime methods require the optional `luxon` peer dependency):

```ts
import { StrUtils } from '@mrreality255/turbo-react-forms';

// Build CSS class strings — supports conditional object syntax
StrUtils.classes('btn', { 'btn-primary': isPrimary, 'btn-disabled': isDisabled });
// → "btn btn-primary" (if isPrimary=true, isDisabled=false)

// Parse and format dates (requires luxon)
const dt = StrUtils.parseDateTime('2026-07-29');
StrUtils.formatDateTime(dt, 'date'); // locale short date
StrUtils.formatDateTime(dt, 'datetime'); // locale short date + time
StrUtils.formatDateTime(1753800000, 'time'); // from unix timestamp
```

### `DataUtils`

Low-level data helpers used throughout the library, also available for consumer code:

```ts
import { DataUtils } from '@mrreality255/turbo-react-forms';

DataUtils.distinct([1, 2, 2, 3]); // [1, 2, 3]
DataUtils.orNone(maybeVal, (v) => v * 2); // transforms if defined, else undefined
DataUtils.using(value, (v) => transform(v)); // inline transform (like let binding)
DataUtils.Validity.isValid(validity); // boolean check on TValidity
DataUtils.Validity.getHint(validity); // extract hint string
```

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
                    data.setValue(
                        'name',
                        e.currentTarget.value,
                        e.currentTarget.value.length > 0 ? true : { valid: false, hint: 'Required' }
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

Creates a typed form hook bound to your UI library. Returns `{ useForm, newEmptyList, useFormContext }`.

The `lib` object accepts:

| Key                          | Description                                                       |
| ---------------------------- | ----------------------------------------------------------------- |
| `controls`                   | Map of control type definitions                                   |
| `validators`                 | Map of named validator functions                                  |
| `onInit`                     | Returns initial `FormEnv` state                                   |
| `showMethod`                 | Custom method to display the form (default: layer manager)        |
| `hideMethod`                 | Custom method to hide the form                                    |
| `onRenderControl`            | Wraps every individual control (receives `renderProps`)           |
| `onRenderMainWrapper`        | Renders the outer form shell (receives `formEnv`)                 |
| `onRenderTemplate`           | Renders a template list wrapper                                   |
| `onRenderTemplateRow`        | Renders each template row (receives `isNew` flag)                 |
| `onRenderTemplateRowControl` | Wraps each control within a template row (receives `renderProps`) |
| `onRenderSubform`            | Renders a subform wrapper                                         |
| `onRenderSubformControl`     | Wraps each control within a subform (receives `renderProps`)      |
| `onTranslateHint`            | Global hint translation                                           |

### `useMyForm(config)` → `{ show }`

| `config` key          | Description                                                                                                                                    |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `form`                | Static props or `(state, cmdCtx) => props` passed to `onRenderMainWrapper`                                                                     |
| `controls`            | Control list or `(state, cmdCtx) => list`                                                                                                      |
| `onSubmit`            | Async function called on submit; return `{ submitData }` to resolve. Submit closes by default. Use `preventClose: true` to keep the form open. |
| `onUpdate`            | Called on every data change or command; return context/data/env patches. Can return a Promise (form enters `'waiting'` mode).                  |
| `onRenderMainWrapper` | Per-config override for the form shell renderer                                                                                                |
| `onTranslateHint`     | Map hint keys to display strings                                                                                                               |

### `form.show(initData, ctx, submitFct?)`

Opens the form in a modal layer and returns a `Promise<TFormSubmitCtx | null>`. Resolves when the form is submitted or `null` when cancelled.

| Parameter   | Description                                                                |
| ----------- | -------------------------------------------------------------------------- |
| `initData`  | `TDataObjectMap \| null` — initial field values                            |
| `ctx`       | Your context object, available as `state.ctx`                              |
| `submitFct` | Optional per-invocation submit handler (overrides config-level `onSubmit`) |

### `useFormContext()` (inside a form wrapper)

```ts
const ctx = useFormContext();
ctx.data              // IDataObject — live access to form data
ctx.ctx               // your Ctx value
ctx.formEnv           // current FormEnv
ctx.setFormEnv(...)   // update FormEnv
ctx.close()           // close without submitting
ctx.submit()          // trigger submit programmatically
ctx.submitEx(result)  // resolve with a custom submit result
ctx.triggerCommand(cmd)    // fire a command (string, object, or Promise)
ctx.triggerLoading(loader, onDone)  // run async work with loading state
ctx.hideMethodRef.current = (prev) => { /* animate then call prev() */ }
```

### Submit return shape — `TFormSubmitFctData`

```ts
{
    id?: TKey;                         // optional result identifier
    submitData: SubmitType;            // your typed return value
    rawData?: IDataObject;             // override the raw data in the result
    cancel?: boolean;                  // resolve as null (cancelled)
    preventClose?: boolean;            // keep form open after submit
    ctxUpdateFct?: (prev: Ctx) => Ctx; // update context after submit
    ctxUpdateEnv?: (prev: FormEnv) => FormEnv; // update FormEnv after submit
}
```

### `onUpdate` return shape — `TFormUpdateContext`

```ts
{
    ctx?: Ctx;                         // replace the form context
    modalResult?: TFormSubmitFctData;   // auto-submit with this result
    onUpdateData?: (prev, replacerFct) => TDataObject;  // patch raw data
    onUpdateEnv?: (prev: FormEnv) => FormEnv;           // patch FormEnv
}
```

---

## License

MIT — Martin Mojzis
