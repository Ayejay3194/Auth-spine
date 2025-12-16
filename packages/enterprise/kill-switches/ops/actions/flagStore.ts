type FlagValue = unknown;

const store: Record<string, FlagValue> = {
  "auth.rateLimit.strict": false,
  "auth.captcha.enabled": false,
  "auth.tokenRefresh.enabled": true,
  "auth.blockNewSignups": false,
  "auth.forceLogoutAll": false,
};

export function getFlag(key: string) {
  return store[key];
}

export function setFlag(key: string, value: FlagValue) {
  const before = store[key];
  store[key] = value;
  return { before, after: store[key] };
}

export function snapshotFlags() {
  return { ...store };
}
