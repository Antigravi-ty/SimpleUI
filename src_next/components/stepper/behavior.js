export function initStepper(element) {
  if (element._uiBound) return;
  element._uiBound = true;

  const decBtn = element.querySelector('.ui-stepper__btn--dec');
  const incBtn = element.querySelector('.ui-stepper__btn--inc');
  const display = element.querySelector('.ui-stepper__val') || element.querySelector('.ui-stepper__input');
  if (!display) return;

  const isInput = display.tagName === 'INPUT';
  const min = parseFloat(display.getAttribute('min') ?? '0');
  const max = parseFloat(display.getAttribute('max') ?? '99');
  const step = parseFloat(display.getAttribute('step') ?? '1');

  const getVal = () => parseFloat(isInput ? display.value : display.textContent) || 0;
  const setVal = (val) => {
    const clamped = Math.min(max, Math.max(min, val));
    if (isInput) display.value = String(clamped);
    else display.textContent = String(clamped);
    element.dispatchEvent(new CustomEvent('change', { detail: { value: clamped }, bubbles: true }));
  };

  const onDec = () => setVal(getVal() - step);
  const onInc = () => setVal(getVal() + step);

  if (decBtn) decBtn.addEventListener('click', onDec);
  if (incBtn) incBtn.addEventListener('click', onInc);

  let commitInput, onInputKeyDown;
  if (isInput && !display.hasAttribute('readonly')) {
    let lastValid = display.value;

    commitInput = () => {
      let val = parseFloat(display.value);
      if (isNaN(val)) {
        display.value = lastValid;
      } else {
        const clamped = Math.min(max, Math.max(min, val));
        display.value = String(clamped);
        lastValid = display.value;
        element.dispatchEvent(new CustomEvent('change', { detail: { value: clamped }, bubbles: true }));
      }
    };

    onInputKeyDown = (e) => {
      if (e.key === 'Enter') {
        commitInput();
        display.blur();
      } else if (e.key === 'Escape') {
        display.value = lastValid;
        display.blur();
      }
    };

    display.addEventListener('blur', commitInput);
    display.addEventListener('keydown', onInputKeyDown);
  }

  element._uiCleanup = () => {
    if (decBtn) decBtn.removeEventListener('click', onDec);
    if (incBtn) incBtn.removeEventListener('click', onInc);
    if (commitInput) {
      display.removeEventListener('blur', commitInput);
      display.removeEventListener('keydown', onInputKeyDown);
    }
    delete element._uiBound;
  };
}
