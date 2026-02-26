export interface GuardrailReport {
  ok: boolean;
  issues: string[];
}

export function enforceContextLimit(input: string, maxChars: number): GuardrailReport {
  const ok = input.length <= maxChars;
  return { ok, issues: ok ? [] : ["context_too_large"] };
}

export function enforceNoSecrets(text: string): GuardrailReport {
  const issues: string[] = [];
  const redacted: string[] = [];
  
  // Pattern definitions for various secret types
  const patterns = [
    { name: 'aws_access_key', pattern: /AKIA[0-9A-Z]{16}/g },
    { name: 'aws_secret_key', pattern: /[0-9a-zA-Z/+]{40}/g },
    { name: 'github_token', pattern: /ghp_[0-9a-zA-Z]{36}/g },
    { name: 'github_oauth', pattern: /gho_[0-9a-zA-Z]{36}/g },
    { name: 'private_key', pattern: /-----BEGIN (RSA |EC |DSA |OPENSSH )?PRIVATE KEY-----/g },
    { name: 'api_key_generic', pattern: /api[_-]?key\s*[:=]\s*['"]?[0-9a-zA-Z]{32,}['"]?/gi },
    { name: 'bearer_token', pattern: /bearer\s+[0-9a-zA-Z_-]{20,}/gi },
    { name: 'password', pattern: /password\s*[:=]\s*['"][^'"]{8,}['"]/gi },
    { name: 'secret', pattern: /secret\s*[:=]\s*['"][^'"]{8,}['"]/gi },
    { name: 'token', pattern: /token\s*[:=]\s*['"][0-9a-zA-Z]{20,}['"]/gi },
    { name: 'credit_card', pattern: /\b(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13}|3[0-9]{13}|6(?:011|5[0-9]{2})[0-9]{12})\b/g },
    { name: 'ssn', pattern: /\b\d{3}-\d{2}-\d{4}\b/g },
    { name: 'email_password', pattern: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}:[^\s]{6,}/g },
    { name: 'jwt_token', pattern: /eyJ[A-Za-z0-9_-]*\.eyJ[A-Za-z0-9_-]*\.[A-Za-z0-9_-]*/g },
    { name: 'slack_token', pattern: /xox[baprs]-[0-9a-zA-Z]{10,48}/g },
    { name: 'stripe_key', pattern: /sk_live_[0-9a-zA-Z]{24,}/g },
    { name: 'discord_webhook', pattern: /https:\/\/discord\.com\/api\/webhooks\/\d+\/[0-9a-zA-Z_-]+/g },
    { name: 'url_with_password', pattern: /https?:\/\/[^:]+:[^@]+@[^\s]+/g }
  ];
  
  let redactedText = text;
  
  for (const { name, pattern } of patterns) {
    const matches = text.match(pattern);
    if (matches) {
      for (const match of matches) {
        issues.push(`Detected potential ${name}: ${match.substring(0, 20)}...`);
        // Redact the secret
        const redactedMatch = match.substring(0, 4) + '****' + match.substring(match.length - 4);
        redactedText = redactedText.replace(match, redactedMatch);
        redacted.push(name);
      }
    }
  }
  
  // Check for entropy-based detection (high entropy strings that look like secrets)
  const highEntropyPattern = /[0-9a-fA-F]{32,}|[0-9a-zA-Z+/]{40,}/g;
  const entropyMatches = text.match(highEntropyPattern);
  if (entropyMatches) {
    for (const match of entropyMatches) {
      // Skip if already caught by other patterns
      if (redacted.some(r => match.includes(r))) continue;
      
      // Calculate Shannon entropy
      const entropy = calculateEntropy(match);
      if (entropy > 4.5) { // High entropy threshold
        issues.push(`Detected high-entropy string (potential secret)`);
        redactedText = redactedText.replace(match, match.substring(0, 4) + '****');
      }
    }
  }
  
  return { 
    ok: issues.length === 0, 
    issues,
    redacted: redacted.length > 0 ? redactedText : undefined
  };
}

function calculateEntropy(str: string): number {
  const freq: Record<string, number> = {};
  for (const char of str) {
    freq[char] = (freq[char] || 0) + 1;
  }
  
  let entropy = 0;
  const len = str.length;
  for (const count of Object.values(freq)) {
    const p = count / len;
    entropy -= p * Math.log2(p);
  }
  
  return entropy;
}
