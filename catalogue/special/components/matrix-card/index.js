import './style.css';
export { default as matrixCardSchema } from './schema.json';

export function renderMatrixCard(blockSchema, options = {}) {
  const card = document.createElement('section');
  card.className = 'sp-cata-matrix-card';
  card.id = `block-${blockSchema.name}`;

  const header = document.createElement('div');
  header.className = 'sp-cata-matrix-card__header';
  header.innerHTML = `
    <div class="sp-cata-matrix-card__info">
      <div class="sp-cata-matrix-card__title-row">
        <h3 class="sp-cata-matrix-card__title">${blockSchema.name}</h3>
        <span class="sp-cata-matrix-card__prefix"><code>.${blockSchema.prefix}</code></span>
        <span class="ui-badge ui-badge--neutral ui-badge--sm">2D Matrix</span>
      </div>
      <p class="sp-cata-matrix-card__desc">${blockSchema.description || 'Standard multi-variant atomic component.'}</p>
      ${blockSchema.redirectLink ? `
        <p class="sp-cata-matrix-card__redirect">
          ${blockSchema.redirectLink.prefixText || ''}
          <a href="${blockSchema.redirectLink.url}" class="sp-cata-matrix-card__redirect-link">${blockSchema.redirectLink.linkText || blockSchema.redirectLink.text}</a>
        </p>
      ` : ''}
    </div>
    <div class="sp-cata-matrix-card__filter-bar">
      <span class="sp-cata-matrix-card__filter-label">Appearance:</span>
      <label class="ui-checkbox ui-checkbox--sm ui-checkbox--neutral ui-checkbox--checked">
        <input type="checkbox" class="ui-checkbox__input" checked data-filter-mod="neutral">
        <span class="ui-checkbox__box"><svg class="ui-checkbox__check" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3.5 8.5 6.5 11.5 12.5 4.5"/></svg></span>
        <span class="ui-checkbox__label">Neutral</span>
      </label>
      <label class="ui-checkbox ui-checkbox--sm ui-checkbox--neutral ui-checkbox--checked">
        <input type="checkbox" class="ui-checkbox__input" checked data-filter-mod="outline">
        <span class="ui-checkbox__box"><svg class="ui-checkbox__check" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3.5 8.5 6.5 11.5 12.5 4.5"/></svg></span>
        <span class="ui-checkbox__label">Outline</span>
      </label>
      <label class="ui-checkbox ui-checkbox--sm ui-checkbox--neutral ui-checkbox--checked">
        <input type="checkbox" class="ui-checkbox__input" checked data-filter-mod="primary">
        <span class="ui-checkbox__box"><svg class="ui-checkbox__check" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3.5 8.5 6.5 11.5 12.5 4.5"/></svg></span>
        <span class="ui-checkbox__label">Primary</span>
      </label>
      <label class="ui-checkbox ui-checkbox--sm ui-checkbox--neutral ui-checkbox--checked">
        <input type="checkbox" class="ui-checkbox__input" checked data-filter-mod="disabled">
        <span class="ui-checkbox__box"><svg class="ui-checkbox__check" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3.5 8.5 6.5 11.5 12.5 4.5"/></svg></span>
        <span class="ui-checkbox__label">Disabled</span>
      </label>
    </div>
  `;
  card.appendChild(header);

  // Table Matrix
  const tableWrapper = document.createElement('div');
  tableWrapper.className = 'sp-cata-matrix-card__table-wrapper';
  const table = document.createElement('table');
  table.className = 'sp-cata-matrix-card__table';

  const modifiers = ['neutral', 'outline', 'primary', 'disabled'];
  const sizes = blockSchema.sizes || ['sm', 'md', 'lg'];

  // thead
  let theadHtml = `<thead><tr><th class="sp-cata-matrix-card__row-header">Size \\ Variant</th>`;
  for (const mod of modifiers) {
    theadHtml += `<th data-col-mod="${mod}">${mod.charAt(0).toUpperCase() + mod.slice(1)}</th>`;
  }
  theadHtml += `</tr></thead>`;

  // tbody
  let tbodyHtml = `<tbody>`;
  for (const size of sizes) {
    tbodyHtml += `<tr><td class="sp-cata-matrix-card__row-header"><strong>${size.toUpperCase()}</strong></td>`;
    for (const mod of modifiers) {
      tbodyHtml += `<td class="sp-cata-matrix-card__cell" data-col-mod="${mod}">
        ${renderSampleElement(blockSchema, size, mod)}
      </td>`;
    }
    tbodyHtml += `</tr>`;
  }
  tbodyHtml += `</tbody>`;

  table.innerHTML = theadHtml + tbodyHtml;
  tableWrapper.appendChild(table);
  card.appendChild(tableWrapper);

  // Wire filter bar events
  card.querySelectorAll('[data-filter-mod]').forEach(checkbox => {
    checkbox.addEventListener('change', () => {
      const mod = checkbox.dataset.filterMod;
      const th = table.querySelector(`thead th[data-col-mod="${mod}"]`);
      if (th) th.style.display = checkbox.checked ? '' : 'none';
      table.querySelectorAll(`tbody td[data-col-mod="${mod}"]`).forEach(td => {
        td.style.display = checkbox.checked ? '' : 'none';
      });
    });
  });

  return card;
}

function renderSampleElement(s, size, mod) {
  const p = s.prefix;
  const isDisabled = mod === 'disabled';
  const activeMod = isDisabled ? 'neutral' : mod;
  const disabledAttr = isDisabled ? 'disabled aria-disabled="true"' : '';
  const text = s.defaultText || 'Option title';

  if (s.name === 'button') {
    return `<button type="button" class="${p} ${p}--${size} ${p}--${activeMod}" ${disabledAttr}>${mod === 'disabled' ? 'Disabled' : 'Action'}</button>`;
  }
  if (s.name === 'badge') {
    return `<span class="${p} ${p}--${size} ${p}--${activeMod}">${mod === 'disabled' ? 'Inactive' : 'Badge'}</span>`;
  }
  if (s.name === 'checkbox') {
    return `
      <label class="${p} ${p}--${size} ${p}--${activeMod} ${isDisabled ? 'ui-checkbox--disabled' : 'ui-checkbox--checked'}">
        <input type="checkbox" class="${p}__input" ${isDisabled ? 'disabled' : 'checked'}>
        <span class="${p}__box"><svg class="${p}__check" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3.5 8.5 6.5 11.5 12.5 4.5"/></svg></span>
        <span class="${p}__label">${text}</span>
      </label>
    `;
  }
  if (s.name === 'toggler') {
    return `
      <label class="${p} ${p}--${size} ${p}--${activeMod} ${isDisabled ? 'ui-toggler--disabled' : 'ui-toggler--checked'}">
        <input type="checkbox" class="${p}__input" ${isDisabled ? 'disabled' : 'checked'}>
        <span class="${p}__track"><span class="${p}__thumb"></span></span>
        <span class="${p}__label">${text}</span>
      </label>
    `;
  }
  if (s.name === 'slider') {
    return `
      <div class="${p} ${p}--${size} ${p}--${activeMod}" ${disabledAttr} style="width: 140px;">
        <input type="range" class="${p}__input" min="0" max="100" value="50" ${disabledAttr}>
        <span class="${p}__value">50</span>
      </div>
    `;
  }
  if (s.name === 'stepper') {
    return `
      <div class="${p} ${p}--${size} ${p}--${activeMod}" ${disabledAttr}>
        <button type="button" class="${p}__btn ${p}__btn--dec" ${disabledAttr}>-</button>
        <span class="${p}__val">5</span>
        <button type="button" class="${p}__btn ${p}__btn--inc" ${disabledAttr}>+</button>
      </div>
    `;
  }
  if (s.name === 'progressbar') {
    return `
      <div class="${p} ${p}--${size} ${p}--${activeMod}" ${disabledAttr} style="width: 140px;">
        <div class="${p}__track"><div class="${p}__fill" style="width: 60%;"></div></div>
      </div>
    `;
  }
  if (s.name === 'segmented-control') {
    return `
      <div class="${p} ${p}--${size} ${p}--${activeMod}" ${disabledAttr}>
        <button type="button" class="${p}__item ${p}__item--active" ${disabledAttr}>Option 1</button>
        <button type="button" class="${p}__item" ${disabledAttr}>Option 2</button>
      </div>
    `;
  }
  if (s.name === 'selective-card') {
    return `
      <div class="${p} ${p}--${size} ${p}--${activeMod} ${isDisabled ? 'ui-selective-card--disabled' : 'ui-selective-card--selected'}" ${disabledAttr} style="max-width: 150px; padding: var(--ui-space-3);">
        <strong style="font-size: var(--ui-font-xs);">Option Title</strong>
        <p style="font-size: 10px; color: var(--ui-text-muted); margin: 2px 0 0 0;">Relative description</p>
      </div>
    `;
  }
  if (s.name === 'tabs') {
    return `
      <div class="${p} ${p}--${size} ${p}--${activeMod}" ${disabledAttr}>
        <button type="button" class="${p}__item ${p}__item--active" ${disabledAttr}>Tab 1</button>
        <button type="button" class="${p}__item" ${disabledAttr}>Tab 2</button>
      </div>
    `;
  }
  if (s.name === 'dropdown') {
    return `
      <div class="${p} ${p}--${size} ${p}--${activeMod}" ${disabledAttr} style="position: relative; display: inline-block;">
        <button type="button" class="${p}__trigger" ${disabledAttr} style="padding: 4px 8px; font-size: var(--ui-font-xs);">
          <span>Action</span>
          <svg class="${p}__arrow" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
        </button>
      </div>
    `;
  }
  return `<div class="${p} ${p}--${size} ${p}--${activeMod}">Sample</div>`;
}
