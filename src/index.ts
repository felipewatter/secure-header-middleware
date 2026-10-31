import type {
  HstsOptions,
  SecureHeaderOptions,
  SecureHeadersRequest,
  SecureHeadersResponse,
  NextFunction,
} from './types';

export type {
  HstsOptions,
  SecureHeaderOptions,
  SecureHeadersRequest,
  SecureHeadersResponse,
  NextFunction,
  FrameOptions,
  ReferrerPolicy,
  CrossOriginOpenerPolicy,
  CrossOriginResourcePolicy,
} from './types';

/** Reject response-splitting and accidentally unbounded header values. */
function headerValue(name: string, value: string): string {
  if (typeof value !== 'string' || value.length === 0 || value.length > 8192 || /[\x00-\x1f\x7f]/.test(value)) {
    throw new TypeError('Invalid value for ' + name);
  }
  return value;
}

function hstsValue(value: boolean | HstsOptions | undefined): string | undefined {
  if (value === false) return undefined;
  const options: HstsOptions = value === true || value === undefined ? {} : value;
  if (options === null || typeof options !== 'object' || Array.isArray(options)) {
    throw new TypeError('strictTransportSecurity must be a boolean or options object');
  }
  const maxAge = options.maxAgeSeconds ?? 31536000;
  if (!Number.isSafeInteger(maxAge) || maxAge < 0 || maxAge > 63072000) {
    throw new TypeError('HSTS maxAgeSeconds must be an integer between 0 and 63072000');
  }
  const includeSubDomains = options.includeSubDomains ?? false;
  const preload = options.preload ?? false;
  if (typeof includeSubDomains !== 'boolean' || typeof preload !== 'boolean') {
    throw new TypeError('HSTS flags must be booleans');
  }
  if (preload && (!includeSubDomains || maxAge < 31536000)) {
    throw new TypeError('HSTS preload requires includeSubDomains and maxAgeSeconds >= 31536000');
  }
  return 'max-age=' + maxAge + (includeSubDomains ? '; includeSubDomains' : '') + (preload ? '; preload' : '');
}

function oneOf<T extends string>(name: string, value: T | false | undefined, values: readonly T[]): T | undefined {
  if (value === false || value === undefined) return undefined;
  if (!values.includes(value)) throw new TypeError('Invalid value for ' + name);
  return value;
}

/**
 * Express-compatible middleware with safe, explicit defaults.
 *
 * HSTS is only emitted when Express marks the request as secure (or the
 * underlying socket is TLS). For TLS reverse proxies, configure Express
 * trust proxy for your known proxy addresses; never trust arbitrary
 * X-Forwarded-Proto headers.
 */
export default function secureHeaders(options: SecureHeaderOptions = {}) {
  if (options === null || typeof options !== 'object' || Array.isArray(options)) {
    throw new TypeError('Options must be an object');
  }

  const headers: Array<[string, string]> = [];
  if (options.xContentTypeOptions !== false) {
    headers.push(['X-Content-Type-Options', 'nosniff']);
  }
  const frame = oneOf('xFrameOptions', options.xFrameOptions ?? 'DENY', ['DENY', 'SAMEORIGIN']);
  if (frame) headers.push(['X-Frame-Options', frame]);

  const xss = oneOf('xXssProtection', options.xXssProtection ?? '0', ['0', '1; mode=block']);
  if (xss) headers.push(['X-XSS-Protection', xss]);

  const referrer = oneOf('referrerPolicy', options.referrerPolicy ?? 'no-referrer', [
    'no-referrer', 'same-origin', 'strict-origin', 'strict-origin-when-cross-origin', 'origin-when-cross-origin',
  ]);
  if (referrer) headers.push(['Referrer-Policy', referrer]);

  if (options.contentSecurityPolicy !== false && options.contentSecurityPolicy !== undefined) {
    headers.push(['Content-Security-Policy', headerValue('Content-Security-Policy', options.contentSecurityPolicy)]);
  }
  if (options.permissionsPolicy !== false && options.permissionsPolicy !== undefined) {
    headers.push(['Permissions-Policy', headerValue('Permissions-Policy', options.permissionsPolicy)]);
  }

  const opener = oneOf('crossOriginOpenerPolicy', options.crossOriginOpenerPolicy, [
    'same-origin', 'same-origin-allow-popups', 'unsafe-none',
  ]);
  if (opener) headers.push(['Cross-Origin-Opener-Policy', opener]);

  const resource = oneOf('crossOriginResourcePolicy', options.crossOriginResourcePolicy, [
    'same-origin', 'same-site', 'cross-origin',
  ]);
  if (resource) headers.push(['Cross-Origin-Resource-Policy', resource]);

  const hsts = hstsValue(options.strictTransportSecurity);
  return function secureHeadersMiddleware(
    req: SecureHeadersRequest,
    res: SecureHeadersResponse,
    next: NextFunction,
  ): void {
    for (const [name, value] of headers) res.setHeader(name, value);
    if (hsts && (req.secure === true || req.socket?.encrypted === true)) {
      res.setHeader('Strict-Transport-Security', hsts);
    }
    next();
  };
}
