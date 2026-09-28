import './style.css';
import { getSchemaBadgeClass } from '../helpers.js';
import matrixFrameSchema from './schema.json';
import modifierCategoriesData from '@catalogue/schemas/modifier-categories.json';
import { interpret } from '@src_next/core/slot-resolver.js';
import { defaultActionEngine } from '@src_next/core/action-engine.js';

export { matrixFrameSchema };

const DEFAULT_COLUMNS = [
  'Neutral',
  'Outline',
  'Primary',
  'Success',
  'Primary Subtle',
  'Success Subtle'
];

const DEFAULT_ROWS = ['sm', 'md', 'lg'];

/**
 * Categorize flat columns into semantic groups driven by catalogue/schemas/modifier-categories.json
 */
function categorizeColumns(columns) {
  const schemaCats = modifierCategoriesData?.categories || {};
  const categories = [
    { id: 'all', label: 'All Modifiers', count: columns.length, indices: columns.map((_, i) => i) }
  ];

  for (const [catKey, catDef] of Object.entries(schemaCats)) {
    categories.push({
      id: catDef.id || catKey,
      label: catDef.label || catKey,
      count: 0,
      indices: [],
      modifiers: (catDef.modifiers || []).map(m => m.toLowerCase())
    });
  }

  columns.forEach((col, idx) => {
    const lower = col.toLowerCase();
    const matched = categories.find(c => c.id !== 'all' && c.modifiers?.includes(lower));
    if (matched) {
      matched.indices.push(idx);
    } else {
      const partial = categories.find(c => c.id !== 'all' && c.modifiers?.some(m => lower.includes(m)));
      if (partial) {
        partial.indices.push(idx);
      } else {
        const fallback = categories.find(c => c.id === 'solid') || categories.find(c => c.id === 'neutral');
        if (fallback) fallback.indices.push(idx);
      }
    }
  });

  categories.forEach(c => { c.count = c.indices.length; });
  const activeCategories = categories.filter(c => c.id === 'all' || c.count > 0);

  return { categories: activeCategories };
}

// -------------------------------------------------------------
// Global Declarative Action Handlers for Matrix Frames
// -------------------------------------------------------------
defaultActionEngine.register('matrix.filter', ({ element }) => {
  const frameRoot = element.closest('.draft-sp-cata-matrix-frame');
  if (!frameRoot) return;

  const inputEl = element.matches('input') ? element : element.querySelector('input');
  const isChecked = inputEl ? inputEl.checked : !element.classList.contains('ui-checkbox--checked');
  const catId = element.getAttribute('data-cat-id') || element.dataset.catId;

  if (catId === 'all') {
    frameRoot.querySelectorAll('.draft-sp-cata-matrix-frame__filter-item').forEach(item => {
      const inp = item.querySelector('input');
      if (inp) inp.checked = isChecked;
      item.classList.toggle('ui-checkbox--checked', isChecked);
      item.classList.toggle('draft-ui-checkbox--checked', isChecked);
    });
    frameRoot.querySelectorAll('[data-col-idx]').forEach(cell => {
      cell.classList.toggle('draft-sp-cata-matrix-frame__col--hidden', !isChecked);
      cell.classList.toggle('draft-sp-cata-matrix-frame__cell--hidden', !isChecked);
    });
    return;
  }

  const indicesStr = element.getAttribute('data-indices') || element.dataset.indices || '';
  const indices = indicesStr.split(',').filter(Boolean).map(Number);
  indices.forEach(idx => {
    frameRoot.querySelectorAll(`[data-col-idx="${idx}"]`).forEach(cell => {
      cell.classList.toggle('draft-sp-cata-matrix-frame__col--hidden', !isChecked);
      cell.classList.toggle('draft-sp-cata-matrix-frame__cell--hidden', !isChecked);
    });
  });

  const specificItems = Array.from(frameRoot.querySelectorAll('.draft-sp-cata-matrix-frame__filter-item:not([data-cat-id="all"])'));
  const allChecked = specificItems.every(it => {
    const inp = it.querySelector('input');
    return inp ? inp.checked : it.classList.contains('ui-checkbox--checked');
  });
  const allItem = frameRoot.querySelector('.draft-sp-cata-matrix-frame__filter-item[data-cat-id="all"]');
  if (allItem) {
    const allInp = allItem.querySelector('input');
    if (allInp) allInp.checked = allChecked;
    allItem.classList.toggle('ui-checkbox--checked', allChecked);
    allItem.classList.toggle('draft-ui-checkbox--checked', allChecked);
  }
});

defaultActionEngine.register('matrix.lens', ({ element }) => {
  const frameRoot = element.closest('.draft-sp-cata-matrix-frame');
  if (!frameRoot) return;

  const dimKey = element.getAttribute('data-dim') || element.dataset.dim;
  const newVal = element.getAttribute('data-value') || element.dataset.value;
  if (!dimKey || !newVal) return;

  if (dimKey === 'align') {
    frameRoot.querySelectorAll('.ui-dropdown, .draft-ui-dropdown').forEach(dd => {
      dd.classList.remove(
        'ui-dropdown--align-left', 'ui-dropdown--align-center', 'ui-dropdown--align-right',
        'draft-ui-dropdown--align-left', 'draft-ui-dropdown--align-center', 'draft-ui-dropdown--align-right'
      );
      dd.classList.add(`ui-dropdown--align-${newVal}`, `draft-ui-dropdown--align-${newVal}`);
    });
  }
});

/**
 * renderMatrixFrame - Pure declarative Matrix catalogue staging macro.
 * 
 * Complies with the Universal "Modifier + Slot" Architecture:
 * - Emits pure declarative Spec tree ({ pattern: 'three-stage', header, content })
 * - Zero handwritten DOM manipulation
 * - Zero private closures (delegates all events to universal ActionEngine)
 */
export function renderMatrixFrame(options = {}, context = {}) {
  const {
    id,
    title = 'Matrix Frame',
    badge = '.draft-sp-cata-matrix-frame',
    status = 'draft',
    badgeClass = options.badgeClass || getSchemaBadgeClass(badge),
    description,
    hasRedirectReference = false,
    haveRedirectReference = false,
    redirectLink,
    columns = DEFAULT_COLUMNS,
    rows = DEFAULT_ROWS,
    renderCell,
    stageContent,
    className = '',
    attributes = {}
  } = options;

  const variantDimensions = options.variantDimensions || options.schema?.variantDimensions || null;
  const hasVariantDimensions = Boolean(
    options.hasVariantDimensions !== false &&
    options.haveVariantDimensions !== false &&
    variantDimensions &&
    typeof variantDimensions === 'object' &&
    Object.keys(variantDimensions).length > 0
  );
  const hasFilterBar = options.hasFilterBar !== undefined ? Boolean(options.hasFilterBar) : (options.haveFilterBar !== undefined ? Boolean(options.haveFilterBar) : true);

  const dimKeys = hasVariantDimensions ? Object.keys(variantDimensions) : [];
  const activeDimKey = (hasVariantDimensions && variantDimensions.content) ? 'content' : (dimKeys[0] || null);

  const variantState = {};
  if (hasVariantDimensions) {
    dimKeys.forEach(k => {
      const d = variantDimensions[k];
      variantState[k] = d.default !== undefined ? d.default : (d.options?.[0]?.value || 'default');
    });
  }

  if (description === undefined || description === null || description === '') {
    throw new Error('[CatalogueSpecialMatrixFrame] "description" is required in frame configuration.');
  }

  const isRedirectAllowed = Boolean(hasRedirectReference || haveRedirectReference);
  if (redirectLink !== undefined && redirectLink !== null) {
    if (!isRedirectAllowed) {
      throw new Error(
        '[Frame Conflict] Passing "redirectLink" detected, but "hasRedirectReference" is false or undefined. Did you forget to set hasRedirectReference: true?'
      );
    }
  }

  // 1. Declarative Header Slot Spec
  const toSee = redirectLink?.toSee || '';
  const checkText = redirectLink?.checkText || redirectLink?.linkText || 'documentation';
  const targetUrl = redirectLink?.url || '#';
  const prefixText = toSee ? `To see ${toSee}, check ` : (redirectLink?.prefixText || '');

  const headerSpec = {
    type: 'box',
    className: 'sp-cata-frame__header',
    children: [
      {
        type: 'box',
        className: 'sp-cata-frame__header-left',
        children: [
          {
            type: 'row',
            className: 'sp-cata-frame__title-row',
            children: [
              { tag: 'h3', className: 'sp-cata-frame__title', text: title },
              badge ? { block: 'badge', size: 'sm', className: badgeClass, content: badge } : null
            ].filter(Boolean)
          },
          { tag: 'p', className: 'sp-cata-frame__desc', text: description },
          (isRedirectAllowed && redirectLink) ? {
            tag: 'p',
            className: 'sp-cata-frame__redirect',
            children: [
              prefixText ? { tag: 'span', text: prefixText } : null,
              {
                tag: 'a',
                className: 'sp-cata-frame__redirect-link',
                attributes: { href: targetUrl },
                text: `${checkText} ↗`
              }
            ].filter(Boolean)
          } : null
        ].filter(Boolean)
      }
    ]
  };

  // 2. Custom Stage Content
  if (stageContent) {
    return {
      pattern: 'three-stage',
      id,
      className: `draft-sp-cata-matrix-frame sp-cata-frame ${className}`.trim(),
      attributes,
      header: headerSpec,
      content: {
        type: 'container',
        className: 'draft-sp-cata-matrix-frame__body',
        children: [stageContent]
      },
      footer: null
    };
  }

  // 3. Declarative Filter Bar Spec
  const { categories } = categorizeColumns(columns);

  const filterBarSpec = {
    type: 'box',
    className: 'draft-sp-cata-matrix-frame__filter-bar',
    children: [
      { tag: 'span', className: 'draft-sp-cata-matrix-frame__filter-label', text: 'Appearance:' },
      {
        type: 'row',
        className: 'draft-sp-cata-matrix-frame__filter-group',
        children: categories.map(cat => ({
          block: 'checkbox',
          id: `filter-${cat.id}`,
          checked: true,
          size: 'sm',
          modifier: 'neutral',
          className: 'draft-sp-cata-matrix-frame__filter-item',
          content: `<span>${cat.label}</span> <span class="draft-sp-cata-matrix-frame__filter-count">${cat.count}</span>`,
          action: 'matrix.filter',
          attributes: {
            'data-cat-id': cat.id,
            'data-indices': cat.indices.join(','),
            'data-action': 'matrix.filter',
            style: 'user-select: none;'
          }
        }))
      }
    ]
  };

  // 4. Declarative Dynamic Cell Resolution Spec
  const targetBlock = options.block || options.component || null;

  const resolveCellSpec = (row, col, idx, currentVariantState) => {
    if (typeof renderCell === 'function') {
      return renderCell(row, col, idx, currentVariantState);
    }
    if (targetBlock) {
      return {
        block: targetBlock,
        props: { size: row, modifier: col, ...currentVariantState }
      };
    }
    return null;
  };

  const buildRowsSpec = (currentVariantState) => {
    return rows.map(row => ({
      type: 'tr',
      cells: [
        {
          type: 'td',
          className: 'draft-sp-cata-matrix-frame__row-header',
          content: `<strong>${row}</strong>`
        },
        ...columns.map((col, idx) => {
          const customCell = resolveCellSpec(row, col, idx, currentVariantState);
          return {
            type: 'td',
            className: 'draft-sp-cata-matrix-frame__cell',
            attributes: {
              'data-col-idx': String(idx),
              'data-row': row,
              'data-col': col
            },
            content: (customCell !== null && customCell !== undefined)
              ? customCell
              : `<div class="draft-sp-cata-matrix-frame__slot-placeholder">[${row} × ${col}]</div>`
          };
        })
      ]
    }));
  };

  // 5. Declarative Variant Dimension Lens Bar Spec
  let lensBarSpec = null;
  if (hasVariantDimensions && dimKeys.length > 0) {
    const currentDim = variantDimensions[activeDimKey];

    const buildSegmentedSpec = () => {
      if (!currentDim || !Array.isArray(currentDim.options)) return null;

      return {
        block: 'segmented-control',
        props: {
          size: 'sm',
          items: currentDim.options.map(opt => ({
            value: opt.value,
            label: opt.label,
            active: String(opt.value) === String(variantState[activeDimKey]),
            attributes: {
              'data-action': 'matrix.lens',
              'data-dim': activeDimKey,
              'data-value': opt.value
            }
          })),
          value: variantState[activeDimKey],
          action: 'matrix.lens',
          attributes: {
            'data-action': 'matrix.lens',
            'data-dim': activeDimKey
          }
        }
      };
    };

    const buildDropdownSpec = () => {
      if (dimKeys.length <= 1) return null;

      const menuItems = dimKeys.map(k => {
        const d = variantDimensions[k];
        const activeOpt = d.options?.find(o => String(o.value) === String(variantState[k]));
        const badgeLabel = activeOpt?.label || String(variantState[k]);
        return {
          id: k,
          label: d.label,
          active: k === activeDimKey,
          badge: badgeLabel,
          attributes: {
            'data-action': 'matrix.active_dim',
            'data-dim': k
          }
        };
      });

      return {
        block: 'dropdown',
        props: {
          size: 'sm',
          modifier: 'neutral',
          triggerLabel: `Dimension: ${currentDim.label}`,
          items: menuItems,
          className: 'draft-sp-cata-matrix-frame__lens-dropdown'
        }
      };
    };

    lensBarSpec = {
      type: 'box',
      className: 'draft-sp-cata-matrix-frame__lens-bar',
      children: [
        dimKeys.length > 1
          ? {
              type: 'box',
              className: 'draft-sp-cata-matrix-frame__lens-dropdown-wrap',
              children: [buildDropdownSpec()]
            }
          : {
              tag: 'span',
              className: 'draft-sp-cata-matrix-frame__lens-label',
              text: `${variantDimensions[activeDimKey]?.label}:`
            },
        {
          type: 'box',
          className: 'draft-sp-cata-matrix-frame__lens-segmented-wrap',
          children: [buildSegmentedSpec()]
        }
      ]
    };
  }

  // 6. Declarative Table Spec
  const tableWrapperSpec = {
    type: 'container',
    className: 'draft-sp-cata-matrix-frame__table-wrapper',
    children: [
      {
        type: 'table',
        className: 'draft-sp-cata-matrix-frame__table',
        head: [
          {
            type: 'tr',
            cells: [
              {
                type: 'th',
                className: 'draft-sp-cata-matrix-frame__row-header',
                content: 'Type \\ Modifier'
              },
              ...columns.map((col, idx) => ({
                type: 'th',
                className: 'draft-sp-cata-matrix-frame__col-header',
                attributes: { 'data-col-idx': String(idx) },
                content: `<span>${col}</span>`
              }))
            ]
          }
        ],
        rows: buildRowsSpec(variantState)
      }
    ]
  };

  // 7. Return Pure Composite Structural Pattern Spec
  return {
    pattern: 'three-stage',
    id,
    className: `draft-sp-cata-matrix-frame sp-cata-frame ${className}`.trim(),
    attributes,
    header: headerSpec,
    content: {
      type: 'container',
      className: 'draft-sp-cata-matrix-frame__body',
      children: [
        hasFilterBar ? filterBarSpec : null,
        hasVariantDimensions ? lensBarSpec : null,
        tableWrapperSpec
      ].filter(Boolean)
    },
    footer: null
  };
}
