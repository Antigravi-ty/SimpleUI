import { SignalEngine } from './core/signal-engine.js';
import { GliderEngine, attachGlider } from './core/glider-engine.js';
import { SimpleUIStore, defaultStore, registerStoreAdapter } from './core/store.js';
import { SimpleUIEngine, schemaRegistry, registerSchema, getSchema } from './core/engine.js';
import { components, initCheckbox, initDropdown, initProgressBar, initSegmentedControl, initSelectiveCard, initSelectiveGroup, initSlider, initStepper, initTabs, initToggler } from './components/index.js';
import { primitives } from './primitives/index.js';
import { patterns, initPanel } from './patterns/index.js';
import { animations, executeMorphTransition, initLivePreview } from './animations/index.js';
import {
  BehaviorRegistry,
  defaultBehaviorRegistry,
  registerBehavior,
  bindAllBehaviors,
  destroyBehaviors
} from './core/behavior-registry.js';
import {
  interpret,
  resolveSlotContent,
  registerSlotComponent,
  getSlotComponent,
  componentRegistry,
  registerPattern,
  getPattern,
  registerModule,
  getModule,
  patternRegistry,
  moduleRegistry
} from './core/slot-resolver.js';
import {
  componentFactory,
  createComponentFactory,
  render
} from './core/component-factory.js';

export {
  SignalEngine,
  GliderEngine,
  attachGlider,
  SimpleUIStore,
  defaultStore,
  registerStoreAdapter,
  SimpleUIEngine,
  schemaRegistry,
  registerSchema,
  getSchema,
  components,
  primitives,
  patterns,
  animations,
  BehaviorRegistry,
  defaultBehaviorRegistry,
  registerBehavior,
  bindAllBehaviors,
  destroyBehaviors,
  interpret,
  resolveSlotContent,
  registerSlotComponent,
  getSlotComponent,
  componentRegistry,
  registerPattern,
  getPattern,
  registerModule,
  getModule,
  patternRegistry,
  moduleRegistry,
  componentFactory,
  createComponentFactory,
  render
};

// Register default behaviors for atomic and pattern components
registerBehavior('.ui-checkbox', initCheckbox);
registerBehavior('.ui-dropdown', initDropdown);
registerBehavior('.ui-panel', initPanel);
registerBehavior('.ui-progressbar', initProgressBar);
registerBehavior('.ui-segmented-control', initSegmentedControl);
registerBehavior('.ui-selective-card', initSelectiveCard);
registerBehavior('.ui-selective-group', initSelectiveGroup);
registerBehavior('.ui-slider', initSlider);
registerBehavior('.ui-stepper', initStepper);
registerBehavior('.ui-tabs', initTabs);
registerBehavior('.ui-toggler', initToggler);

export default {
  components,
  primitives,
  patterns,
  animations,
  bindAllBehaviors
};
