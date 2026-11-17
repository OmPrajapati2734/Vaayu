import { z } from 'zod';

/**
 * AeroSense AI Security & Input Sanitization Suite
 * Aligned with OWASP Top 10 and LLM Prompt Injection Defenses
 */

// ==========================================
// 1. INPUT SANITIZATION & XSS PROTECTION
// ==========================================

const DANGEROUS_PATTERNS = [
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /javascript\s*:[^"'>]*/gi,
  /on\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi,
  /data:\s*text\/html/gi,
  /document\s*\.\s*cookie/gi,
  /window\s*\.\s*location/gi,
];

/**
 * Sanitizes raw user input by stripping malicious script tags, event handlers, and javascript URIs.
 * @param input Raw text string from user input or external source
 * @param maxLen Optional maximum allowed character length
 * @returns Clean, safe string
 */
export function sanitizeInput(input: string, maxLen?: number): string {
  if (typeof input !== 'string') return '';
  
  let clean = input.trim();
  for (const pattern of DANGEROUS_PATTERNS) {
    clean = clean.replace(pattern, '');
  }

  // Escape HTML tags and dangerous characters
  clean = clean
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');

  if (typeof maxLen === 'number' && maxLen > 0 && clean.length > maxLen) {
    clean = clean.substring(0, maxLen);
  }

  return clean;
}

/**
 * Reverses HTML entity escaping for display within React safe JSX tree
 */
export function unescapeForDisplay(sanitized: string): string {
  return sanitized
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'");
}

/**
 * Enforces length constraints on user text inputs to prevent memory exhaustion and DoS
 */
export function validateLength(input: string, maxLen = 1000): string {
  if (input.length > maxLen) {
    return input.substring(0, maxLen);
  }
  return input;
}

// ==========================================
// 2. PROMPT INJECTION & DELIMITER FENCING
// ==========================================

const PROMPT_INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?(previous|prior|above)\s+instructions/i,
  /disregard\s+(all\s+)?(previous|prior|above)\s+(instructions|directives|rules)/i,
  /you\s+are\s+now\s+in\s+developer\s+mode/i,
  /reveal\s+(system\s+prompt|internal\s+secret)/i,
  /system\s+prompt\s+dump/i,
  /system\s+override/i,
];

/**
 * Fences user queries inside strict boundary delimiters and inspects for prompt injection attempts.
 * @param userQuery The query provided by the user
 * @returns Formatted query string with delimiter fencing and safety flags
 */
export function fenceAndGuardPrompt(userQuery: string): {
  safePrompt: string;
  isInjectionDetected: boolean;
  fencedText: string;
} {
  const isInjectionDetected = PROMPT_INJECTION_PATTERNS.some((p) => p.test(userQuery));
  
  let fencedText = `=== BEGIN UNTRUSTED USER INPUT ===\n${userQuery.trim()}\n=== END UNTRUSTED USER INPUT ===`;
  if (isInjectionDetected) {
    fencedText = `[SYSTEM WARNING: Suspected instruction alteration pattern detected]\n` + fencedText;
  }

  return {
    safePrompt: fencedText,
    isInjectionDetected,
    fencedText,
  };
}

// ==========================================
// 3. CLIENT-SIDE TOKEN-BUCKET RATE LIMITER
// ==========================================

export class RateLimiter {
  private tokens: number;
  private readonly maxTokens: number;
  private readonly refillRatePerMs: number;
  private lastRefillTimestamp: number;

  constructor(maxTokens = 20, refillWindowMs = 60000) {
    this.maxTokens = maxTokens;
    this.tokens = maxTokens;
    this.refillRatePerMs = maxTokens / refillWindowMs;
    this.lastRefillTimestamp = Date.now();
  }

  private refill(): void {
    const now = Date.now();
    const elapsed = now - this.lastRefillTimestamp;
    const tokensToAdd = elapsed * this.refillRatePerMs;
    this.tokens = Math.min(this.maxTokens, this.tokens + tokensToAdd);
    this.lastRefillTimestamp = now;
  }

  public allowRequest(tokensRequired = 1): boolean {
    this.refill();
    if (this.tokens >= tokensRequired) {
      this.tokens -= tokensRequired;
      return true;
    }
    return false;
  }

  public tryAcquire(tokensRequired = 1): boolean {
    return this.allowRequest(tokensRequired);
  }

  public getAvailableTokens(): number {
    this.refill();
    return Math.floor(this.tokens);
  }
}

// ==========================================
// 4. OPEN-METEO API RUNTIME ZOD SCHEMA
// ==========================================

export const OpenMeteoCurrentSchema = z.object({
  time: z.string().optional(),
  pm2_5: z.number().nullable().optional(),
  pm10: z.number().nullable().optional(),
  carbon_monoxide: z.number().nullable().optional(),
  nitrogen_dioxide: z.number().nullable().optional(),
  sulphur_dioxide: z.number().nullable().optional(),
  ozone: z.number().nullable().optional(),
  us_aqi: z.number().nullable().optional(),
});

export const OpenMeteoHourlySchema = z.object({
  time: z.array(z.string()).optional(),
  pm2_5: z.array(z.number().nullable()).optional(),
  pm10: z.array(z.number().nullable()).optional(),
  us_aqi: z.array(z.number().nullable()).optional(),
  boundary_layer_height: z.array(z.number().nullable()).optional(),
}).optional();

export const OpenMeteoResponseSchema = z.object({
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  current: OpenMeteoCurrentSchema.optional(),
  hourly: OpenMeteoHourlySchema.optional(),
});
export type OpenMeteoResponse = z.infer<typeof OpenMeteoResponseSchema>;
