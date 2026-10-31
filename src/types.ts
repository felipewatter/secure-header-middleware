/** Minimal Express-compatible request surface; no runtime Express dependency. */
export interface SecureHeadersRequest {
  readonly secure?: boolean;
  readonly socket?: { readonly encrypted?: boolean };
}

/** Works with Express response objects and simple test doubles. */
export interface SecureHeadersResponse {
  setHeader(name: string, value: string): unknown;
}

export type NextFunction = (error?: unknown) => void;

export interface HstsOptions {
  /** Whole seconds, 0 through 63,072,000 (two years). Default 31,536,000. */
  maxAgeSeconds?: number;
  /** Apply the policy to all subdomains. Explicit opt-in. */
  includeSubDomains?: boolean;
  /** Browser preload enrollment is a long-term commitment. Explicit opt-in. */
  preload?: boolean;
}

export type FrameOptions = 'DENY' | 'SAMEORIGIN';
export type ReferrerPolicy =
  | 'no-referrer'
  | 'same-origin'
  | 'strict-origin'
  | 'strict-origin-when-cross-origin'
  | 'origin-when-cross-origin';
export type CrossOriginOpenerPolicy = 'same-origin' | 'same-origin-allow-popups' | 'unsafe-none';
export type CrossOriginResourcePolicy = 'same-origin' | 'same-site' | 'cross-origin';

export interface SecureHeaderOptions {
  /** Application-specific CSP; opt-in to avoid breaking application assets. */
  contentSecurityPolicy?: string | false;
  /** On by default only for HTTPS requests; no preload or subdomain claims by default. */
  strictTransportSecurity?: boolean | HstsOptions;
  xContentTypeOptions?: boolean;
  xFrameOptions?: FrameOptions | false;
  /** Legacy protection is disabled ('0') by default, as in modern Helmet. */
  xXssProtection?: '0' | '1; mode=block' | false;
  referrerPolicy?: ReferrerPolicy | false;
  permissionsPolicy?: string | false;
  crossOriginOpenerPolicy?: CrossOriginOpenerPolicy | false;
  crossOriginResourcePolicy?: CrossOriginResourcePolicy | false;
}
