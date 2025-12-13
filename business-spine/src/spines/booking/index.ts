import { spine as bookingSpine } from './spine.js';
import { Spine } from '../../core/types.js';

export function createSpine(config?: any): Spine {
  return bookingSpine;
}

export { spine as bookingSpine } from './spine.js';
