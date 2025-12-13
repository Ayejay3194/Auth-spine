import { spine as adminSecuritySpine } from './spine.js';
import { Spine } from '../../core/types.js';

export function createSpine(config?: any): Spine {
  return adminSecuritySpine;
}

export { spine as adminSecuritySpine } from './spine.js';
