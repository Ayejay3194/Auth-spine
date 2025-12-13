import { spine as paymentsSpine } from './spine.js';
import { Spine } from '../../core/types.js';

export function createSpine(config?: any): Spine {
  return paymentsSpine;
}

export { spine as paymentsSpine } from './spine.js';
