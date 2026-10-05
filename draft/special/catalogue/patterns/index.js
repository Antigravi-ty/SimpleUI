export { renderStandardFrame, standardFrameSchema } from './standard-frame/index.js';
export { renderMatrixFrame, matrixFrameSchema } from './matrix-frame/index.js';
export { renderInteractionFrame, interactionFrameSchema } from './interaction-frame/index.js';
export { renderCatalogueShellLayout } from '../shell-layout/index.js';
export {
  resolveSlotContent,
  registerSlotComponent,
  getSlotComponent,
  registerPattern,
  getPattern,
  registerModule,
  getModule
} from './slot-resolver.js';
export { getSchemaBadge, getSchemaBadgeClass } from './helpers.js';

import { registerSlotComponent, registerPattern } from './slot-resolver.js';
import { draftComponents } from '@draft/components/index.js';
import { componentFactory } from '@src_next/core/component-factory.js';

import { renderStandardFrame } from './standard-frame/index.js';
import { renderMatrixFrame } from './matrix-frame/index.js';
import { renderInteractionFrame } from './interaction-frame/index.js';
import { renderCatalogueShellLayout } from '../shell-layout/index.js';
import { renderDropdownMenu } from '@draft/patterns/dropdown-menu/index.js';
import { renderThreeStageContainer } from '@draft/patterns/three-stage/index.js';

// Pre-register standard draft components into universal slot resolver via componentFactory
for (const [name, def] of Object.entries(draftComponents)) {
  const schema = def.schema || def;
  const behavior = def.behavior || null;
  registerSlotComponent(name, (props, ctx) => componentFactory(schema, props, behavior, ctx));
}

// Pre-register canonical patterns
registerPattern('standard-frame', renderStandardFrame);
registerPattern('matrix-frame', renderMatrixFrame);
registerPattern('interaction-frame', renderInteractionFrame);
registerPattern('catalogue-shell-layout', renderCatalogueShellLayout);
registerPattern('draft-sp-cata-shell-layout', renderCatalogueShellLayout);
registerPattern('dropdown-menu', renderDropdownMenu);

registerPattern('three-stage', renderThreeStageContainer);
