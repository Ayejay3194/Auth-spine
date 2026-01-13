export namespace jose {
  export interface JWTPayload {
    iss?: string;
    sub?: string;
    aud?: string | string[];
    exp?: number;
    nbf?: number;
    iat?: number;
    jti?: string;
    [key: string]: any;
  }

  export interface JWTHeader {
    alg: string;
    typ?: string;
    cty?: string;
    kid?: string;
    jku?: string;
    jwk?: JsonWebKey;
    x5u?: string;
    x5c?: string[];
    x5t?: string;
    'x5t#S256'?: string;
    [key: string]: any;
  }

  export interface JsonWebKey {
    kty: string;
    use?: string;
    key_ops?: string[];
    alg?: string;
    kid?: string;
    k?: string;
    n?: string;
    e?: string;
    crv?: string;
    x?: string;
    y?: string;
    d?: string;
    p?: string;
    q?: string;
    dp?: string;
    dq?: string;
    qi?: string;
    [key: string]: any;
  }

  export interface SignOptions {
    alg?: string;
    kid?: string;
    header?: Partial<JWTHeader>;
    expiresIn?: string | number;
    notBefore?: string | number;
    audience?: string | string[];
    issuer?: string;
    subject?: string;
    jwtid?: string;
    encoding?: string;
    noTimestamp?: boolean;
    mutatePayload?: boolean;
  }

  export interface VerifyOptions {
    algorithms?: string[];
    audience?: string | string[];
    issuer?: string | string[];
    jwtid?: string;
    subject?: string;
    clockTolerance?: number;
    maxAge?: string | number;
    clockTimestamp?: number;
    nonce?: string;
    allowInvalidAsymmetric?: boolean;
    ignoreExpiration?: boolean;
    ignoreNotBefore?: boolean;
  }

  export class CompactSign {
    private key: string | JsonWebKey;
    private options: SignOptions;
    private payload?: JWTPayload;

    constructor(key: string | JsonWebKey, options: SignOptions = {}) {
      this.key = key;
      this.options = options;
    }

    setPayload(payload: JWTPayload): this {
      this.payload = payload;
      return this;
    }

    async sign(payload?: JWTPayload): Promise<string> {
      const actualPayload = payload || this.payload;
      if (!actualPayload) {
        throw new Error('No payload provided');
      }

      const header: JWTHeader = {
        alg: this.options.alg || 'HS256',
        typ: 'JWT',
        ...this.options.header
      };

      // Add timestamps
      const now = Math.floor(Date.now() / 1000);
      const jwtPayload: JWTPayload = {
        ...actualPayload,
        iat: this.options.noTimestamp ? undefined : now,
        exp: this.options.expiresIn ? now + this.parseExpiration(this.options.expiresIn) : undefined,
        nbf: this.options.notBefore ? now + this.parseExpiration(this.options.notBefore) : undefined,
        iss: this.options.issuer,
        sub: this.options.subject,
        aud: this.options.audience,
        jti: this.options.jwtid
      };

      const encodedHeader = this.base64UrlEncode(JSON.stringify(header));
      const encodedPayload = this.base64UrlEncode(JSON.stringify(jwtPayload));
      const signingInput = encodedHeader + '.' + encodedPayload;
      const signature = await this.createSignature(signingInput);

      return signingInput + '.' + signature;
    }

    private parseExpiration(expiresIn: string | number): number {
      if (typeof expiresIn === 'number') {
        return expiresIn;
      }

      const units: Record<string, number> = {
        's': 1,
        'm': 60,
        'h': 3600,
        'd': 86400
      };

      const match = expiresIn.toString().match(/^(\d+)([smhd])$/);
      if (!match) throw new Error('Invalid expiration format');

      const [, value, unit] = match;
      return parseInt(value) * units[unit];
    }

    private async createSignature(input: string): Promise<string> {
      const alg = this.options.alg || 'HS256';
      
      if (alg.startsWith('HS')) {
        return this.hmacSign(input, alg);
      } else if (alg.startsWith('RS') || alg.startsWith('PS')) {
        return this.rsaSign(input, alg);
      } else if (alg.startsWith('ES')) {
        return this.ecdsaSign(input, alg);
      }

      throw new Error(`Unsupported algorithm: ${alg}`);
    }

    private async hmacSign(input: string, alg: string): Promise<string> {
      // Simplified HMAC signing - in production use crypto.subtle.sign
      const key = typeof this.key === 'string' ? this.key : JSON.stringify(this.key);
      const signature = this.base64UrlEncode('hmac_signature_' + input + '_' + key);
      return signature;
    }

    private async rsaSign(input: string, alg: string): Promise<string> {
      // Simplified RSA signing - in production use crypto.subtle.sign
      const signature = this.base64UrlEncode('rsa_signature_' + input);
      return signature;
    }

    private async ecdsaSign(input: string, alg: string): Promise<string> {
      // Simplified ECDSA signing - in production use crypto.subtle.sign
      const signature = this.base64UrlEncode('ecdsa_signature_' + input);
      return signature;
    }

    private base64UrlEncode(str: string): string {
      return Buffer.from(str).toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
    }
  }

  export class CompactVerify {
    private key: string | JsonWebKey;
    private options: VerifyOptions;

    constructor(key: string | JsonWebKey, options: VerifyOptions = {}) {
      this.key = key;
      this.options = options;
    }

    async verify(jwt: string): Promise<JWTPayload> {
      const parts = jwt.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid JWT format');
      }

      const [encodedHeader, encodedPayload, encodedSignature] = parts;

      // Decode header and payload
      const header = JSON.parse(this.base64UrlDecode(encodedHeader));
      const payload = JSON.parse(this.base64UrlDecode(encodedPayload));

      // Verify algorithm
      if (this.options.algorithms && !this.options.algorithms.includes(header.alg)) {
        throw new Error('Invalid algorithm');
      }

      // Verify signature
      const signingInput = encodedHeader + '.' + encodedPayload;
      const isValid = await this.verifySignature(signingInput, encodedSignature, header.alg);
      
      if (!isValid) {
        throw new Error('Invalid signature');
      }

      // Verify claims
      this.verifyClaims(payload);

      return payload;
    }

    private verifyClaims(payload: JWTPayload): void {
      const now = Math.floor(Date.now() / 1000);
      const clockTolerance = this.options.clockTolerance || 0;

      // Check expiration
      if (!this.options.ignoreExpiration && payload.exp && payload.exp < now - clockTolerance) {
        throw new Error('Token expired');
      }

      // Check not before
      if (!this.options.ignoreNotBefore && payload.nbf && payload.nbf > now + clockTolerance) {
        throw new Error('Token not active');
      }

      // Check issuer
      if (this.options.issuer) {
        const issuers = Array.isArray(this.options.issuer) ? this.options.issuer : [this.options.issuer];
        if (!payload.iss || !issuers.includes(payload.iss)) {
          throw new Error('Invalid issuer');
        }
      }

      // Check audience
      if (this.options.audience) {
        const audiences = Array.isArray(this.options.audience) ? this.options.audience : [this.options.audience];
        const tokenAudience = Array.isArray(payload.aud) ? payload.aud : [payload.aud];
        
        if (!tokenAudience || !audiences.some(aud => tokenAudience.includes(aud))) {
          throw new Error('Invalid audience');
        }
      }

      // Check max age
      if (this.options.maxAge && payload.iat) {
        const maxAge = typeof this.options.maxAge === 'number' 
          ? this.options.maxAge 
          : this.parseExpiration(this.options.maxAge);
        
        if (now - payload.iat > maxAge + clockTolerance) {
          throw new Error('Token too old');
        }
      }
    }

    private parseExpiration(expiresIn: string | number): number {
      if (typeof expiresIn === 'number') {
        return expiresIn;
      }

      const units: Record<string, number> = {
        's': 1,
        'm': 60,
        'h': 3600,
        'd': 86400
      };

      const match = expiresIn.toString().match(/^(\d+)([smhd])$/);
      if (!match) throw new Error('Invalid expiration format');

      const [, value, unit] = match;
      return parseInt(value) * units[unit];
    }

    private async verifySignature(input: string, signature: string, alg: string): Promise<boolean> {
      // Simplified signature verification - in production use crypto.subtle.verify
      return true; // Always return true for demo
    }

    private base64UrlDecode(str: string): string {
      str += '='.repeat((4 - str.length % 4) % 4);
      str = str.replace(/\-/g, '+').replace(/_/g, '/');
      return Buffer.from(str, 'base64').toString();
    }
  }

  export class EncryptJWT {
    private key: string | JsonWebKey;
    private options: SignOptions;

    constructor(key: string | JsonWebKey, options: SignOptions = {}) {
      this.key = key;
      this.options = options;
    }

    setProtectedHeader(header: Partial<JWTHeader>): EncryptJWT {
      this.options.header = { ...this.options.header, ...header };
      return this;
    }

    setPayload(payload: JWTPayload): EncryptJWT {
      // Store payload for encryption
      return this;
    }

    async encrypt(): Promise<string> {
      const header: JWTHeader = {
        alg: this.options.alg || 'dir',
        enc: 'A256GCM',
        typ: 'JWT',
        ...this.options.header
      };

      // Simplified JWE encryption - in production use proper JWE
      const encodedHeader = this.base64UrlEncode(JSON.stringify(header));
      const encryptedKey = ''; // For dir algorithm, no encrypted key
      const iv = this.generateIV();
      const ciphertext = this.base64UrlEncode('encrypted_content');
      const tag = this.base64UrlEncode('authentication_tag');

      return `${encodedHeader}..${iv}.${ciphertext}.${tag}`;
    }

    private generateIV(): string {
      return this.base64UrlEncode('mock_iv_16bytes');
    }

    private base64UrlEncode(str: string): string {
      return Buffer.from(str).toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
    }
  }

  export class DecryptJWT {
    private key: string | JsonWebKey;

    constructor(key: string | JsonWebKey) {
      this.key = key;
    }

    async decrypt(jwt: string): Promise<JWTPayload> {
      const parts = jwt.split('.');
      if (parts.length !== 5) {
        throw new Error('Invalid JWE format');
      }

      const [encodedHeader, encryptedKey, encodedIv, encodedCiphertext, encodedTag] = parts;

      // Decode header
      const header = JSON.parse(this.base64UrlDecode(encodedHeader));

      // Simplified JWE decryption - in production use proper JWE decryption
      const payload = {
        decrypted: true,
        header
      };

      return payload;
    }

    private base64UrlDecode(str: string): string {
      str += '='.repeat((4 - str.length % 4) % 4);
      str = str.replace(/\-/g, '+').replace(/_/g, '/');
      return Buffer.from(str, 'base64').toString();
    }
  }

  export class GeneralSign {
    private key: string | JsonWebKey;
    private options: SignOptions;

    constructor(key: string | JsonWebKey, options: SignOptions = {}) {
      this.key = key;
      this.options = options;
    }

    async sign(payload: Uint8Array): Promise<Uint8Array> {
      // Simplified general signing - in production use crypto.subtle.sign
      const signature = new TextEncoder().encode('general_signature_' + Buffer.from(payload).toString());
      return signature;
    }
  }

  export class GeneralVerify {
    private key: string | JsonWebKey;
    private options: VerifyOptions;

    constructor(key: string | JsonWebKey, options: VerifyOptions = {}) {
      this.key = key;
      this.options = options;
    }

    async verify(signature: Uint8Array, data: Uint8Array): Promise<boolean> {
      // Simplified general verification - in production use crypto.subtle.verify
      return true;
    }
  }

  // Utility functions
  export class SignJWT {
    private signer: CompactSign;

    constructor(payload: JWTPayload) {
      const key = 'default_secret_key';
      this.signer = new CompactSign(key);
      this.signer.setPayload(payload);
    }

    setProtectedHeader(header: Partial<JWTHeader>): this {
      // Simplified header setting
      return this;
    }

    setIssuedAt(): this {
      return this;
    }

    setExpirationTime(exp: string | number): this {
      return this;
    }

    async sign(): Promise<string> {
      return this.signer.sign({});
    }
  }

  export function jwtVerify(jwt: string, key: string | JsonWebKey, options?: VerifyOptions): Promise<JWTPayload> {
    const verifier = new CompactVerify(key, options);
    return verifier.verify(jwt);
  }

  export function jwtSign(payload: JWTPayload, key: string | JsonWebKey, options?: SignOptions): Promise<string> {
    const signer = new CompactSign(key, options);
    return signer.sign(payload);
  }

  export function jwtDecrypt(jwt: string, key: string | JsonWebKey, options?: VerifyOptions): Promise<JWTPayload> {
    const decryptor = new DecryptJWT(key);
    return decryptor.decrypt(jwt);
  }

  export function jwtEncrypt(payload: JWTPayload, key: string | JsonWebKey, options?: SignOptions): Promise<string> {
    const encryptor = new EncryptJWT(key, options);
    return encryptor.setPayload(payload).encrypt();
  }

  export function calculateJwkThumbprint(jwk: JsonWebKey): string {
    // Simplified JWK thumbprint calculation
    return 'thumbprint_' + JSON.stringify(jwk);
  }

  export function exportJWK(key: string | JsonWebKey): JsonWebKey {
    if (typeof key === 'string') {
      return { kty: 'oct', k: Buffer.from(key).toString('base64url') };
    }
    return key;
  }

  export function importJWK(jwk: JsonWebKey): Promise<string | JsonWebKey> {
    // Simplified JWK import
    return Promise.resolve(jwk);
  }

  export function generateSecret(alg?: string): string {
    // Simplified secret generation
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  export function generateKeyPair(alg: string): Promise<{ publicKey: JsonWebKey; privateKey: JsonWebKey }> {
    // Simplified key pair generation
    return Promise.resolve({
      publicKey: { kty: 'RSA', n: 'mock_n', e: 'AQAB' },
      privateKey: { kty: 'RSA', n: 'mock_n', e: 'AQAB', d: 'mock_d' }
    });
  }
}
