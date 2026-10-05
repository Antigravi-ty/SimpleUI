export function initSelectiveGroup(element) {
  if (element._uiBound) return;
  element._uiBound = true;

  const isSingle = () => {
    return element.dataset.selectionMode === 'single' ||
           element.classList.contains('ui-selective-group--single') ||
           element.getAttribute('role') === 'radiogroup';
  };

  const emitGroupChange = () => {
    const selectedCards = Array.from(element.querySelectorAll('.ui-selective-card--selected'));
    const selectedValues = selectedCards.map(c => c.dataset.value || c.textContent.trim());

    element.dispatchEvent(new CustomEvent('change', {
      detail: {
        selectedValues,
        selectedCards,
        value: selectedValues[0] || '',
        count: selectedValues.length,
        isSingle: isSingle(),
        _fromGroup: true
      },
      bubbles: true
    }));
  };

  const onCardChange = (e) => {
    if (e.detail?._fromGroup) return;
    emitGroupChange();
  };

  element.addEventListener('change', onCardChange);

  element._uiCleanup = () => {
    element.removeEventListener('change', onCardChange);
    delete element._uiBound;
  };
}
