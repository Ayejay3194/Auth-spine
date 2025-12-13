import { spine as analyticsSpine } from './spine.js';
import { Spine } from '../../core/types.js';

export function createSpine(config?: any): Spine {
  return analyticsSpine;
}

export { spine as analyticsSpine } from './spine.js';
