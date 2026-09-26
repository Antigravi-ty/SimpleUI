export function initTabs(element) {
  if (element._uiBound) return;
  element._uiBound = true;

  const items = Array.from(element.querySelectorAll('.ui-tabs__item'));
  if (items.length === 0) return;

  const setActive = (target) => {
    if (element.classList.contains('ui-tabs--disabled') || target.disabled) return;
    items.forEach(it => {
      it.classList.remove('ui-tabs__item--active');
      it.setAttribute('aria-selected', 'false');
      it.setAttribute('tabindex', '-1');
    });
    target.classList.add('ui-tabs__item--active');
    target.setAttribute('aria-selected', 'true');
    target.setAttribute('tabindex', '0');
    target.focus();

    element.dispatchEvent(new CustomEvent('change', {
      detail: {
        index: items.indexOf(target),
        value: target.getAttribute('data-value') || target.textContent.trim(),
        label: target.textContent.trim()
      },
      bubbles: true
    }));
  };

  const onItemClick = (e) => setActive(e.currentTarget);

  const onKeyDown = (e) => {
    const activeIdx = items.findIndex(it => it.classList.contains('ui-tabs__item--active'));
    let nextIdx = -1;

    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      nextIdx = (activeIdx + 1) % items.length;
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      nextIdx = (activeIdx - 1 + items.length) % items.length;
    } else if (e.key === 'Home') {
      e.preventDefault();
      nextIdx = 0;
    } else if (e.key === 'End') {
      e.preventDefault();
      nextIdx = items.length - 1;
    }

    if (nextIdx >= 0) setActive(items[nextIdx]);
  };

  items.forEach((it) => {
    const isActive = it.classList.contains('ui-tabs__item--active');
    it.setAttribute('tabindex', isActive ? '0' : '-1');
    it.addEventListener('click', onItemClick);
  });
  element.addEventListener('keydown', onKeyDown);

  element._uiCleanup = () => {
    items.forEach(it => it.removeEventListener('click', onItemClick));
    element.removeEventListener('keydown', onKeyDown);
    delete element._uiBound;
  };
}
