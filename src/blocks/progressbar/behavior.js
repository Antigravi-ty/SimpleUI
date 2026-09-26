export function initProgressBar(el) {
  if (el._uiBound) return;
  el._uiBound = true;

  const fill = el.querySelector('.ui-progressbar__fill');
  const valEl = el.querySelector('.ui-progressbar__value');

  const update = (val) => {
    if (el.classList.contains('ui-progressbar--indeterminate')) return;
    const min = parseFloat(el.getAttribute('aria-valuemin') || '0');
    const max = parseFloat(el.getAttribute('aria-valuemax') || '100');
    const clamped = Math.min(max, Math.max(min, Number(val)));
    const pct = Math.min(100, Math.max(0, ((clamped - min) / (max - min)) * 100));

    el.setAttribute('aria-valuenow', String(clamped));
    if (fill) fill.style.width = `${pct}%`;
    if (valEl) valEl.textContent = `${Math.round(pct)}%`;
  };

  el._uiUpdateProgress = update;
  el._uiCleanup = () => {
    delete el._uiUpdateProgress;
    delete el._uiBound;
  };
}
