## General rule

- The last wrapper of a level and the first wrapper of the level above must be defined in the property object.

## Subform

### Child controls

The wrapping order for each child control is:

1. Core Render Function: The control's specific element is generated (e.g., lib.controls[child.type].onRender(...) for typed controls, child.onRender(...) for custom controls, etc.).

2. Individual Control Wrap (child.onWrap): Wrapped via wrapControl inside 

3. Library-level Subform Control Wrapper (lib.onRenderSubformControl): The form library's wrapper specifically for rendering elements inside subforms (applied in 

4. Subform-level Control Wrapper (ctrl.subform.onWrapControl): Applied to each rendered subform child 

### Subform as a whole

After the array of child components (content) is ready, the subform container is wrapped in the following order:

1. Subform-level Controls Wrapper (ctrl.subform.onWrapControls): Wraps the array of all subform control elements  

2. Library-level Subform Wrapper (lib.onRenderSubform): The form library's wrapper for the overall subform container  

3. Subform Control Wrapper (ctrl.onWrap): The subform control's own wrapper function (ctrl.onWrap), applied via wrapControl in 

4. Library-level Control Wrapper (lib.onRenderControl): The general control wrapper from the form library  


## Templates

### Child items of an row

1. Core render function

2. Own onWrap function

3. Library-level onRenderTemplateControl

4. Template property level onWrapRowControl 

### Rows

1. Template property level onWrapRow

2. Library-level onRenderTemplateRow

### Template obj as a whole

1. Template property level onWrapTemplate

2. Library-level onRenderTemplate 

3. Template object onWrap

4. Library level onRenderControl