import './style.css';
import modifierCategories from '../../../schemas/modifier-categories.json';

/**
 * renderMatrixCard - Automated 2D size x modifier matrix card.
 * Dynamically resolves all modifiers from blockSchema.modifiers, validating against
 * catalogue/schemas/modifier-categories.json, rendering all columns and category filters.
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

  // 2. Discover active categories present in this component with item counts
  const categoryCounts = new Map();
  for (const mod of schemaModifiers) {
    const catId = modToCategory.get(mod);
    if (catId) {
      categoryCounts.set(catId, (categoryCounts.get(catId) || 0) + 1);
    }
  }

  const activeCategories = [];
  for (const [catId, catDef] of Object.entries(modifierCategories.categories)) {
    const count = categoryCounts.get(catId);
    if (count) {
      activeCategories.push({
        id: catId,
        label: `${catDef.label} (${count})`
      });
    }
  }

  // 3. Construct Matrix Header & Categorical Modifier Filter Bar
  const header = document.createElement('div');
  header.className = 'sp-cata-matrix-card__header';

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
      ${activeCategories.map(cat => `
        <label class="ui-checkbox ui-checkbox--sm ui-checkbox--neutral ui-checkbox--checked">
          <input type="checkbox" class="ui-checkbox__input" checked data-filter-category="${cat.id}">
          <span class="ui-checkbox__box"><svg class="ui-checkbox__check" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3.5 8.5 6.5 11.5 12.5 4.5"/></svg></span>
          <span class="ui-checkbox__label">${cat.label}</span>
        </label>
      `).join('')}
    </div>
  `;
  card.appendChild(header);

  // 4. Construct Table Matrix: ALL modifiers from schema are rendered as columns!
  const tableWrapper = document.createElement('div');
  tableWrapper.className = 'sp-cata-matrix-card__table-wrapper';
  const table = document.createElement('table');
  table.className = 'sp-cata-matrix-card__table';

  const sizes = blockSchema.sizes || ['sm', 'md', 'lg'];

  // thead: all 12 modifiers
  let theadHtml = `<thead><tr><th class="sp-cata-matrix-card__row-header">Size \\ Modifier</th>`;
  for (const mod of schemaModifiers) {
    const catId = modToCategory.get(mod) || 'unknown';
    theadHtml += `<th data-col-mod="${mod}" data-col-category="${catId}"><span>${mod}</span></th>`;
  }
  theadHtml += `</tr></thead>`;

  // tbody: all sizes x all modifiers
  let tbodyHtml = `<tbody>`;
  for (const size of sizes) {
    tbodyHtml += `<tr><td class="sp-cata-matrix-card__row-header"><strong>${size.toUpperCase()}</strong></td>`;
    for (const mod of schemaModifiers) {
      const catId = modToCategory.get(mod) || 'unknown';
      tbodyHtml += `<td class="sp-cata-matrix-card__cell" data-col-mod="${mod}" data-col-category="${catId}">
        ${renderSampleElement(blockSchema, size, mod)}
      </td>`;
    }
    tbodyHtml += `</tr>`;
  }
  tbodyHtml += `</tbody>`;

  table.innerHTML = theadHtml + tbodyHtml;
  tableWrapper.appendChild(table);
  card.appendChild(tableWrapper);

  // 5. Wire category filter interactions: toggling a category toggles all modifiers in it
  card.querySelectorAll('[data-filter-category]').forEach(checkbox => {
    checkbox.addEventListener('change', () => {
      const catId = checkbox.dataset.filterCategory;
      const isChecked = checkbox.checked;
      checkbox.closest('.ui-checkbox').classList.toggle('ui-checkbox--checked', isChecked);

      table.querySelectorAll(`[data-col-category="${catId}"]`).forEach(cell => {
        cell.style.display = isChecked ? '' : 'none';
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
