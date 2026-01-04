import type { PrivacyPolicy, ConsentType } from "./types";

export class SimplePrivacy implements PrivacyPolicy {
  // Replace with real consent storage.
  constructor(private allowAll = true) {}
  hasConsent(_: any, __: ConsentType): boolean {
    return this.allowAll;
  }
}
