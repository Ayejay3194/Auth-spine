import type { PrivacyPolicy, ConsentType } from './types';
export class SimplePrivacy implements PrivacyPolicy { constructor(private allowAll=true){} hasConsent(_: any, __: ConsentType){ return this.allowAll; } }
