export interface Clock { nowUtc(): string; }
export class SystemClock implements Clock { nowUtc(): string { return new Date().toISOString(); } }
