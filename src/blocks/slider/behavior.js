export function initSlider(element) {
  if (element._uiBound) return;
  element._uiBound = true;

  const rangeInput = element.querySelector('.ui-slider__input');
  const valueDisplay = element.querySelector('.ui-slider__value');
  const numInput = element.querySelector('.ui-slider__num-input');
  if (!rangeInput) return;

  const unit = element.dataset.unit || rangeInput.dataset.unit || '';
  const isUnbounded = element.classList.contains('ui-slider--unbounded') || element.dataset.unbounded === 'true';

  const formatDisplay = (v) => unit ? `${v}${unit}` : String(v);

  const onRangeInput = () => {
    const val = rangeInput.value;
    if (valueDisplay) valueDisplay.textContent = formatDisplay(val);
    if (numInput) numInput.value = val;
    element.dispatchEvent(new CustomEvent('change', { detail: { value: Number(val) }, bubbles: true }));
  };

  const commitTextValue = () => {
    if (!numInput) return;
    const min = parseFloat(rangeInput.min || '0');
    const max = parseFloat(rangeInput.max || '100');
    let val = parseFloat(numInput.value);

    if (isNaN(val)) {
      val = parseFloat(rangeInput.value);
    } else if (!isUnbounded) {
      val = Math.min(max, Math.max(min, val));
    }

    numInput.value = String(val);
    rangeInput.value = String(Math.min(max, Math.max(min, val)));
    if (valueDisplay) valueDisplay.textContent = formatDisplay(val);
    element.dispatchEvent(new CustomEvent('change', { detail: { value: val }, bubbles: true }));
  };

  const onNumKeyDown = (e) => {
    if (e.key === 'Enter') {
      commitTextValue();
      numInput.blur();
    } else if (e.key === 'Escape') {
      numInput.value = rangeInput.value;
      numInput.blur();
    }
  };

  rangeInput.addEventListener('input', onRangeInput);
  if (numInput) {
    numInput.addEventListener('blur', commitTextValue);
    numInput.addEventListener('keydown', onNumKeyDown);
  }

  if (valueDisplay) valueDisplay.textContent = formatDisplay(rangeInput.value);
  if (numInput) numInput.value = rangeInput.value;

  element._uiCleanup = () => {
    rangeInput.removeEventListener('input', onRangeInput);
    if (numInput) {
      numInput.removeEventListener('blur', commitTextValue);
      numInput.removeEventListener('keydown', onNumKeyDown);
    }
    delete element._uiBound;
  };
}
