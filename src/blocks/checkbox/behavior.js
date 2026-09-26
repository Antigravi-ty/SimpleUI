export function initCheckbox(element) {
  if (element._uiBound) return;
  element._uiBound = true;

  const input = element.querySelector('.ui-checkbox__input');
  if (!input) return;

  const isTriState = element.classList.contains('ui-checkbox--indeterminate') ||
    input.indeterminate ||
    element.hasAttribute('data-tristate');

  if (element.classList.contains('ui-checkbox--indeterminate')) {
    input.indeterminate = true;
    input.checked = false;
  } else if (element.classList.contains('ui-checkbox--checked') || input.checked) {
    input.checked = true;
    input.indeterminate = false;
  }

  const onClick = (e) => {
    if (element.classList.contains('ui-checkbox--disabled') || input.disabled) return;

    if (isTriState) {
      e.preventDefault();
      // Tri-state cycle: indeterminate -> checked -> unchecked -> indeterminate
      if (element.classList.contains('ui-checkbox--indeterminate')) {
        element.classList.remove('ui-checkbox--indeterminate');
        element.classList.add('ui-checkbox--checked');
        input.indeterminate = false;
        input.checked = true;
      } else if (input.checked || element.classList.contains('ui-checkbox--checked')) {
        element.classList.remove('ui-checkbox--checked');
        element.classList.remove('ui-checkbox--indeterminate');
        input.indeterminate = false;
        input.checked = false;
      } else {
        element.classList.add('ui-checkbox--indeterminate');
        element.classList.remove('ui-checkbox--checked');
        input.indeterminate = true;
        input.checked = false;
      }
      element.dispatchEvent(new CustomEvent('change', {
        detail: { checked: input.checked, indeterminate: input.indeterminate },
        bubbles: true
      }));
    }
  };

  const onChange = () => {
    if (isTriState) return;
    element.classList.toggle('ui-checkbox--checked', input.checked);
    element.dispatchEvent(new CustomEvent('change', {
      detail: { checked: input.checked, indeterminate: input.indeterminate },
      bubbles: true
    }));
  };

  element.addEventListener('click', onClick);
  input.addEventListener('change', onChange);

  element._uiCleanup = () => {
    element.removeEventListener('click', onClick);
    input.removeEventListener('change', onChange);
    delete element._uiBound;
  };
}
