import buttonComponent from '@src_next/components/button/index.js';
import { renderMatrixCard } from '@catalogue/special/components/matrix-card/index.js';

export function renderComponentsPage() {
  const container = document.createElement('div');
  container.className = 'catalogue-page catalogue-page--components';

  // Automatically render Button 2D matrix card (all 12 modifiers, full category filters)
  const buttonMatrix = renderMatrixCard(buttonComponent.schema);
  container.appendChild(buttonMatrix);

  return container;
}
