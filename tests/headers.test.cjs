'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { default: secureHeaders } = require('../dist/index.js');

function simulate(options, secure = true) {
  const headers = new Map();
  let nextCalls = 0;
  const middleware = secureHeaders(options);
  middleware(
    { secure },
    { setHeader(name, value) { headers.set(name.toLowerCase(), value); } },
    () => { nextCalls++; },
  );
  return { headers, nextCalls };
}

test('secure HTTPS defaults avoid automatic preload and disable legacy XSS filter', () => {
  const { headers, nextCalls } = simulate();
  assert.equal(nextCalls, 1);
  assert.equal(headers.get('strict-transport-security'), 'max-age=31536000');
  assert.equal(headers.get('x-content-type-options'), 'nosniff');
  assert.equal(headers.get('x-frame-options'), 'DENY');
  assert.equal(headers.get('x-xss-protection'), '0');
  assert.equal(headers.get('referrer-policy'), 'no-referrer');
  assert.equal(headers.has('content-security-policy'), false);
});

test('no HSTS on plain HTTP even with default options', () => {
  assert.equal(simulate(undefined, false).headers.has('strict-transport-security'), false);
});

test('TLS socket fallback works for non-Express adapters', () => {
  const headers = new Map();
  secureHeaders()({ socket: { encrypted: true } }, {
    setHeader(name, value) { headers.set(name, value); },
  }, () => {});
  assert.equal(headers.get('Strict-Transport-Security'), 'max-age=31536000');
});

test('CSP remains opt-in and configurable', () => {
  const { headers } = simulate({ contentSecurityPolicy: "default-src 'self'; object-src 'none'" });
  assert.equal(headers.get('content-security-policy'), "default-src 'self'; object-src 'none'");
});

test('malformed or newline-injected header options are rejected at setup', () => {
  assert.throws(() => secureHeaders({ contentSecurityPolicy: "default-src 'self'\r\nX-Test: injected" }), TypeError);
  assert.throws(() => secureHeaders({ permissionsPolicy: 'camera=()\nmalicious' }), TypeError);
  assert.throws(() => secureHeaders({ contentSecurityPolicy: '' }), TypeError);
});

test('optional policy headers can be configured', () => {
  const { headers } = simulate({
    xFrameOptions: 'SAMEORIGIN',
    referrerPolicy: 'strict-origin-when-cross-origin',
    permissionsPolicy: 'camera=(), microphone=()',
    crossOriginOpenerPolicy: 'same-origin',
    crossOriginResourcePolicy: 'same-site',
  });
  assert.equal(headers.get('x-frame-options'), 'SAMEORIGIN');
  assert.equal(headers.get('permissions-policy'), 'camera=(), microphone=()');
  assert.equal(headers.get('cross-origin-opener-policy'), 'same-origin');
  assert.equal(headers.get('cross-origin-resource-policy'), 'same-site');
});

test('every optional header can be explicitly disabled', () => {
  const { headers } = simulate({
    strictTransportSecurity: false,
    xContentTypeOptions: false,
    xFrameOptions: false,
    xXssProtection: false,
    referrerPolicy: false,
    contentSecurityPolicy: false,
    permissionsPolicy: false,
    crossOriginOpenerPolicy: false,
    crossOriginResourcePolicy: false,
  });
  assert.equal(headers.size, 0);
});

test('HSTS preload requires explicit subdomain coverage and sufficient age', () => {
  assert.throws(() => secureHeaders({ strictTransportSecurity: { preload: true } }), TypeError);
  assert.throws(() => secureHeaders({ strictTransportSecurity: { includeSubDomains: true, preload: true, maxAgeSeconds: 123 } }), TypeError);
  const { headers } = simulate({
    strictTransportSecurity: { maxAgeSeconds: 63072000, includeSubDomains: true, preload: true },
  });
  assert.equal(headers.get('strict-transport-security'), 'max-age=63072000; includeSubDomains; preload');
});

test('HSTS duration validates integer bounds and supports disabling with age zero', () => {
  assert.throws(() => secureHeaders({ strictTransportSecurity: { maxAgeSeconds: -1 } }), TypeError);
  assert.throws(() => secureHeaders({ strictTransportSecurity: { maxAgeSeconds: 1.5 } }), TypeError);
  assert.throws(() => secureHeaders({ strictTransportSecurity: { maxAgeSeconds: Infinity } }), TypeError);
  assert.equal(simulate({ strictTransportSecurity: { maxAgeSeconds: 0 } }).headers.get('strict-transport-security'), 'max-age=0');
});

test('invalid enum values and runtime invalid options fail fast', () => {
  assert.throws(() => secureHeaders({ xFrameOptions: 'ALLOWALL' }), TypeError);
  assert.throws(() => secureHeaders(null), TypeError);
  assert.throws(() => secureHeaders([]), TypeError);
});

test('one next() call and request headers are not overwritten by forwarding headers', () => {
  const headers = new Map();
  let calls = 0;
  secureHeaders()({ secure: false, headers: { 'x-forwarded-proto': 'https' } }, {
    setHeader(name, value) { headers.set(name, value); },
  }, () => { calls++; });
  assert.equal(calls, 1);
  assert.equal(headers.has('Strict-Transport-Security'), false);
});
