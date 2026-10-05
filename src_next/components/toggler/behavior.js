export function initToggler(element) {
  if (element._uiBound) return;
  element._uiBound = true;

  const onClick = () => {
    if (element.disabled || element.classList.contains('ui-toggler--disabled')) return;
    const isChecked = element.classList.toggle('ui-toggler--checked');
    element.setAttribute('aria-checked', String(isChecked));
    element.dispatchEvent(new CustomEvent('change', { detail: { checked: isChecked }, bubbles: true }));
  };

  element.addEventListener('click', onClick);
  element._uiCleanup = () => {
    element.removeEventListener('click', onClick);
    delete element._uiBound;
  };
}
