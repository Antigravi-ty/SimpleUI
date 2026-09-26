import { bindAllBehaviors } from '../index.js';

export class SimpleUIEngine {
  constructor(options = {}) {
    this.schemas = new Map();
    this.options = options;
  }

  loadAutoDiscoveredSchemas(globModules) {
    for (const [, module] of Object.entries(globModules)) {
      const schema = module.default || module;
      if (schema && schema.block) this.registerBlock(schema.block, schema);
      else if (schema && schema.schema && schema.schema.block) this.registerBlock(schema.schema.block, schema.schema);
    }
    return this;
  }

  loadBlocks(blocksObj) {
    for (const [, blockDef] of Object.entries(blocksObj)) {
      if (blockDef && blockDef.schema && blockDef.schema.block) {
        this.registerBlock(blockDef.schema.block, blockDef.schema);
      } else if (blockDef && blockDef.block) {
        this.registerBlock(blockDef.block, blockDef);
      }
    }
    return this;
  }

  registerBlock(name, schema) { this.schemas.set(name, schema); }
  getBlock(name) { return this.schemas.get(name); }
  getAllBlocks() { return Array.from(this.schemas.values()); }

  resolveModifierAttributes(schema, mod) {
    const mappings = schema.stateMappings?.[mod] || {};
    const attrs = new Set();
    let ariaChecked = mod === 'checked' ? 'true' : 'false';
    let ariaDisabled = mod === 'disabled' ? 'true' : 'false';
    let ariaExpanded = mod === 'open' ? 'true' : 'false';
    let ariaPressed = mod === 'selected' ? 'true' : 'false';

    if (mappings['attributes']) {
      mappings['attributes'].split(/\s+/).filter(Boolean).forEach(a => attrs.add(a));
    }
    if (mappings['disabled'] || mod === 'disabled') attrs.add('disabled');
    if (mappings['checked'] || mod === 'checked') attrs.add('checked');
    if (mappings['aria-checked']) ariaChecked = mappings['aria-checked'];
    if (mappings['aria-disabled']) ariaDisabled = mappings['aria-disabled'];
    if (mappings['aria-expanded']) ariaExpanded = mappings['aria-expanded'];
    if (mappings['aria-pressed']) ariaPressed = mappings['aria-pressed'];

    for (const [k, v] of Object.entries(mappings)) {
      if (!['attributes', 'disabled', 'checked', 'aria-checked', 'aria-disabled', 'aria-expanded', 'aria-pressed'].includes(k)) {
        attrs.add(`${k}="${v}"`);
      }
    }
    return { attributesStr: Array.from(attrs).join(' '), ariaChecked, ariaDisabled, ariaExpanded, ariaPressed };
  }

  renderMatrix(blockNameOrSchema, targetSize = 'md') {
    const schema = typeof blockNameOrSchema === 'string' ? this.getBlock(blockNameOrSchema) : blockNameOrSchema;
    if (!schema) throw new Error(`Schema not found for block: ${blockNameOrSchema}`);
    const { block, prefix, modifiers = [], elements = [] } = schema;

    const card = document.createElement('section');
    card.className = 'matrix-card';
    card.id = `block-${block}`;
    card.innerHTML = `
      <div class="matrix-card__header"><div class="matrix-card__info">
        <div class="matrix-card__title-row">
          <h3 class="matrix-card__title">${block}</h3>
          <span class="matrix-card__prefix"><code>.${prefix}</code></span>
        </div>
        <p class="matrix-card__desc">${schema.description || ''}</p>
        ${schema.redirectLink ? `<p class="matrix-card__redirect">${schema.redirectLink.prefixText || ''}<a href="${schema.redirectLink.url}" class="matrix-card__redirect-link">${schema.redirectLink.linkText || schema.redirectLink.text}</a></p>` : ''}
        </div>
      </div>
      <div class="matrix-table-wrapper">
        <table class="matrix-table">
          <thead>
            <tr>
              <th class="matrix-table__corner">Element \\ Modifier</th>
              ${modifiers.map(m => `<th class="matrix-table__col-header"><span>${m}</span><small>.${prefix}--${m}</small></th>`).join('')}
            </tr>
          </thead>
          <tbody></tbody>
        </table>
      </div>
    `;

    const tbody = card.querySelector('tbody');
    for (const elem of elements) {
      const tr = document.createElement('tr');
      const rowHeader = document.createElement('th');
      rowHeader.className = 'matrix-table__row-header';
      rowHeader.innerHTML = `<strong>${elem.label || elem.name}</strong><small>${elem.selector ? '.' + prefix + elem.selector : '(base)'}</small>`;
      tr.appendChild(rowHeader);

      for (const mod of modifiers) {
        const td = document.createElement('td');
        td.className = 'matrix-table__cell';
        const classList = [prefix];
        if (targetSize) classList.push(`${prefix}--${targetSize}`);
        if (elem.selector) classList.push(`${prefix}${elem.selector}`);
        if (mod) classList.push(`${prefix}--${mod}`);

        const state = this.resolveModifierAttributes(schema, mod);

        // Toggler requirement: all togglers default to ON/active (checked), except disabled
        if (block === 'toggler') {
          if (mod !== 'disabled') {
            classList.push(`${prefix}--checked`);
            state.ariaChecked = 'true';
          } else {
            state.ariaChecked = 'false';
          }
        }

        // Checkbox requirement: standard checkboxes default to checked, standalone default to unchecked
        if (block === 'checkbox') {
          if (elem.name === 'standard' && mod !== 'indeterminate') {
            classList.push(`${prefix}--checked`);
            state.ariaChecked = 'true';
            state.attributesStr = (state.attributesStr ? state.attributesStr + ' ' : '') + 'checked';
          }
        }

        const uniqueClasses = Array.from(new Set(classList.filter(Boolean))).join(' ');
        let html = elem.template
          .replace(/\{classes\}/g, uniqueClasses)
          .replace(/\{slot:default\}/g, elem.defaultText || elem.label || 'Action')
          .replace(/\{ariaLabel\}/g, elem.ariaLabel || elem.label || '')
          .replace(/\{ariaChecked\}/g, state.ariaChecked)
          .replace(/\{ariaDisabled\}/g, state.ariaDisabled)
          .replace(/\{ariaExpanded\}/g, state.ariaExpanded)
          .replace(/\{ariaPressed\}/g, state.ariaPressed)
          .replace(/\{attributes\}/g, state.attributesStr);

        for (const [pk, pv] of Object.entries(schema.props || {})) {
          if (pv.default !== undefined) html = html.replace(new RegExp(`\\{${pk}\\}`, 'g'), pv.default);
        }
        td.innerHTML = html;
        tr.appendChild(td);
      }
      tbody.appendChild(tr);
    }
    bindAllBehaviors(card);
    return card;
  }
}
