// Enterprise Auth Suite - Enterprise Authentication
// Exports enterprise auth-related functionality

// Enterprise Auth Components
// export { default as EnterpriseAuthProvider } from './components/EnterpriseAuthProvider';
// export { default as SSOManager } from './components/SSOManager';
// export { default as LDAPConnector } from './components/LDAPConnector';

// Enterprise Auth Hooks
// export { default as useEnterpriseAuth } from './hooks/useEnterpriseAuth';
// export { default as useSSO } from './hooks/useSSO';

// Enterprise Auth Services
// export { default as enterpriseAuthService } from './services/enterpriseAuthService';

// Enterprise Auth Types
export interface EnterpriseAuth {
  id: string;
  tenantId: string;
  userId: string;
  method: 'sso' | 'ldap' | 'oauth' | 'saml';
  provider: string;
  configuration: Record<string, any>;
  isActive: boolean;
  lastUsed: Date;
}

export interface SSOProvider {
  id: string;
  name: string;
  type: 'saml' | 'oauth2' | 'oidc';
  configuration: {
    clientId: string;
    clientSecret: string;
    redirectUri: string;
    authorizationUrl: string;
    tokenUrl: string;
    userInfoUrl: string;
  };
  isActive: boolean;
}

export interface LDAPConfig {
  host: string;
  port: number;
  baseDN: string;
  bindDN: string;
  bindPassword: string;
  userFilter: string;
  attributes: string[];
}

// Enterprise Auth Constants
export const AUTH_METHODS = {
  SSO: 'sso',
  LDAP: 'ldap',
  OAUTH: 'oauth',
  SAML: 'saml'
} as const;

export const SSO_TYPES = {
  SAML: 'saml',
  OAUTH2: 'oauth2',
  OIDC: 'oidc'
} as const;
