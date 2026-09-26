import './style.css';
import modifierCategories from '../../../schemas/modifier-categories.json';

/**
 * renderMatrixCard - Automated 2D size x modifier matrix card.
 * Dynamically resolves sample elements from blockSchema.elements[0].template,
 * validating all modifiers against the catalogue modifier classification dictionary.
 */
export function renderMatrixCard(blockSchema) {
  const card = document.createElement('div');
  card.className = 'sp-cata-matrix-card';
  card.id = `block-${blockSchema.name || blockSchema.block}`;

  // 1. Validate all modifiers against the catalogue classification dictionary (Fail-Fast)
  const registeredModifiers = new Set();
  const modToCategory = new Map();
  for (const cat of Object.values(modifierCategories.categories)) {
    for (const m of cat.modifiers) {
      registeredModifiers.add(m);
      modToCategory.set(m, cat.id);
    }
  }

  const schemaModifiers = blockSchema.modifiers || [];
  for (const mod of schemaModifiers) {
    if (!registeredModifiers.has(mod)) {
      throw new Error(
        `[CatalogueModifierValidationError] Unknown modifier '${mod}' in component '${blockSchema.name || blockSchema.block}'. It does not match any registered category in modifier-categories.json.`
      );
    }
  }

  // 2. Discover active categories present in this component
  const activeCategories = new Set();
  for (const mod of schemaModifiers) {
    const cat = modToCategory.get(mod);
    if (cat) activeCategories.add(cat);
  }

  // 3. Construct Matrix Header & Categorical Modifier Filter Bar
  const header = document.createElement('div');
  header.className = 'sp-cata-matrix-card__header';

  const filterItems = [
    { id: 'neutral', label: 'Neutral' },
    { id: 'outline', label: 'Outline' },
    { id: 'primary', label: 'Primary' },
    { id: 'disabled', label: 'Disabled' }
  ];

  header.innerHTML = `
    <div class="sp-cata-matrix-card__info">
      <div class="sp-cata-matrix-card__title-row">
        <h3 class="sp-cata-matrix-card__title">${blockSchema.name || blockSchema.block}</h3>
        <span class="sp-cata-matrix-card__prefix"><code>.${blockSchema.prefix}</code></span>
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
      ${filterItems.map(item => `
        <label class="ui-checkbox ui-checkbox--sm ui-checkbox--neutral ui-checkbox--checked">
          <input type="checkbox" class="ui-checkbox__input" checked data-filter-mod="${item.id}">
          <span class="ui-checkbox__box"><svg class="ui-checkbox__check" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3.5 8.5 6.5 11.5 12.5 4.5"/></svg></span>
          <span class="ui-checkbox__label">${item.label}</span>
        </label>
      `).join('')}
    </div>
  `;
  card.appendChild(header);

  // 4. Construct Table Matrix
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

  // 5. Wire filter bar interactions
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

/**
 * renderSampleElement - Pure schema-driven element interpolation.
 * Zero hardcoded component name branching.
 */
function renderSampleElement(schema, size, mod) {
  const prefix = schema.prefix;
  const isDisabled = mod === 'disabled';
  const activeMod = isDisabled ? 'neutral' : mod;
  const disabledAttr = isDisabled ? 'disabled aria-disabled="true"' : '';
  const disabledClass = isDisabled ? `${prefix}--disabled` : '';

  const elementDef = (schema.elements && schema.elements[0]) || {};
  const defaultText = isDisabled ? 'Disabled' : (elementDef.defaultText || 'Action');
  const template = elementDef.template || `<button type="button" class="{classes}" {attributes}>{slot:default}</button>`;

  const classes = `${prefix} ${prefix}--${size} ${prefix}--${activeMod} ${disabledClass}`.trim();

  return template
    .replace('{classes}', classes)
    .replace('{attributes}', disabledAttr)
    .replace('{slot:default}', defaultText)
    .replace('{ariaLabel}', elementDef.ariaLabel || defaultText);
}
