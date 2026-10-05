/**
 * Universal polymorphic slot resolver and semantic interpreter.
 * Re-exports canonical implementation from @src_next/core/slot-resolver.js.
 */
export {
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
} from '@src_next/core/slot-resolver.js';
